# Raspberry Pi Kubernetesクラスタへのアプリケーションデプロイ完全ガイド

> **対象読者**: Kubernetes初心者〜中級者、SRE/インフラに関心のある方
> **作成日**: 2025年12月8日
> **前提**: 基本的なKubernetesの概念とコマンドの理解

## 目次

1. [概要](#1-概要)
2. [システムアーキテクチャ](#2-システムアーキテクチャ)
3. [事前準備](#3-事前準備)
4. [フェーズ1: ドメインとIngress設定](#4-フェーズ1-ドメインとingress設定)
5. [フェーズ2: クラスタの問題診断と再構築](#5-フェーズ2-クラスタの問題診断と再構築)
6. [フェーズ3: CNI初期化問題](#6-フェーズ3-cni初期化問題)
7. [フェーズ4: インフラコンポーネントのセットアップ](#7-フェーズ4-インフラコンポーネントのセットアップ)
8. [フェーズ5: GitOps設定](#8-フェーズ5-gitops設定)
9. [フェーズ6: Kustomize設定のトラブルシューティング](#9-フェーズ6-kustomize設定のトラブルシューティング)
10. [フェーズ7: PostgreSQL設定](#10-フェーズ7-postgresql設定)
11. [フェーズ8: データベース接続のトラブルシューティング](#11-フェーズ8-データベース接続のトラブルシューティング)
12. [フェーズ9: 外部アクセス設定](#12-フェーズ9-外部アクセス設定)
13. [フェーズ10: Mixed Contentエラーの解決](#13-フェーズ10-mixed-contentエラーの解決)
14. [フェーズ11: JavaScript MIME typeエラーの解決](#14-フェーズ11-javascript-mime-typeエラーの解決)
15. [フェーズ12: 本番データの移行](#15-フェーズ12-本番データの移行)
16. [ベストプラクティスと学び](#16-ベストプラクティスと学び)
17. [付録](#17-付録)

---

## 1. 概要

### 1.1 プロジェクト概要

本ドキュメントは、React + FastAPIで構築された家庭用タスク管理アプリケーション（household-task-manager）を、Raspberry Pi Kubernetesクラスタにデプロイするまでの全プロセスを記録したものです。

### 1.2 達成目標

- ✅ HTTPS対応の本番環境デプロイ
- ✅ GitOpsによる継続的デプロイ
- ✅ Let's Encryptによる自動TLS証明書管理
- ✅ PostgreSQLデータベースのSSD永続化
- ✅ 本番データの移行

### 1.3 使用技術スタック

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| **Frontend** | React 18 + Vite | SPA |
| **Backend** | FastAPI + Python 3.12 | REST API |
| **Database** | PostgreSQL 16 | データ永続化 |
| **Container** | Docker (multi-stage build) | ARM64イメージ |
| **CI/CD** | GitHub Actions | ARM64ビルド自動化 |
| **Registry** | GitHub Container Registry (GHCR) | コンテナイメージ保存 |
| **Orchestration** | Kubernetes v1.31 (kubeadm) | コンテナオーケストレーション |
| **GitOps** | Argo CD | 宣言的デプロイ |
| **Secret Management** | Sealed Secrets | 暗号化されたSecret管理 |
| **Ingress** | nginx-ingress-controller | HTTPSルーティング |
| **Cert Manager** | cert-manager + Let's Encrypt | TLS証明書自動発行 |
| **DNS** | DuckDNS | 動的DNS |
| **Storage** | local-path-provisioner | 動的ストレージプロビジョニング |

---

## 2. システムアーキテクチャ

### 2.1 インフラ構成

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
│                    (59.171.100.54)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────▼───────────────┐
          │  Home Router                │
          │  Port Forward: 80, 443      │
          │  → 192.168.0.202            │
          └────────────┬────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│              Raspberry Pi k8s Cluster                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  rpi-master-1 (8GB RAM)                              │   │
│  │  - Kubernetes Control Plane                          │   │
│  │  - etcd (on SSD: /mnt/etcd-ssd/etcd)                │   │
│  │  - Argo CD                                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  rpi-worker-1 (4GB RAM)                              │   │
│  │  - PostgreSQL StatefulSet (nodeSelector)            │   │
│  │  - NFS Server                                        │   │
│  │  - Data on SSD: /mnt/ssd-nfs/postgres-data         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  rpi-worker-2 (4GB RAM)                              │   │
│  │  - Backend/Frontend Pods                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Ingress (hostNetwork on all nodes)                  │   │
│  │  household-task-mgr.duckdns.org                      │   │
│  │  ├─ / → frontend:80                                  │   │
│  │  └─ /api → backend:8000 (path rewrite: / )         │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 アプリケーション構成

```
┌─────────────────────────────────────────────────────────────┐
│                   household-task-manager                      │
│                       Namespace                               │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │  Frontend    │      │   Backend    │      │ PostgreSQL│ │
│  │  (Nginx)     │─────▶│  (FastAPI)   │─────▶│           │ │
│  │  Deployment  │      │  Deployment  │      │StatefulSet│ │
│  │  2 replicas  │      │  2 replicas  │      │ 1 replica │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│         ▲                      ▲                    │        │
│         │                      │                    │        │
│    ┌────┴─────┐         ┌─────┴──────┐      ┌──────▼─────┐ │
│    │ Ingress  │         │  ConfigMap │      │    PVC     │ │
│    │ Frontend │         │   Secret   │      │   (SSD)    │ │
│    └──────────┘         └────────────┘      └────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. 事前準備

### 3.1 既存の状態

デプロイ開始時点で以下が完了していました：

- ✅ アプリケーションのコンテナ化（Docker multi-stage build）
- ✅ GitHub Actionsによる ARM64イメージビルド
- ✅ GHCRへのイメージプッシュ
- ✅ Kubernetesマニフェストの作成（別リポジトリ）
- ✅ Raspberry Piクラスタの構築（3ノード）

### 3.2 必要な前提知識

- Kubernetesの基本概念（Pod、Deployment、Service、Ingress）
- kubectl の基本操作
- YAML の記法
- GitOpsの概念
- 基本的なネットワーク知識（DNS、TLS、ポートフォワーディング）

### 3.3 使用ツール

```bash
# クライアント側
kubectl v1.31
gh (GitHub CLI)
ssh
scp

# クラスタ側
kubeadm v1.31
containerd
```

---

## 4. フェーズ1: ドメインとIngress設定

### 4.1 DuckDNS設定

DuckDNSで無料のダイナミックDNSドメインを取得しました。

```
ドメイン: household-task-mgr.duckdns.org
トークン: 20487caa-ed4f-4e03-925f-e4f4b0aed23d
公開IP: 59.171.100.54
```

**学習ポイント**: DuckDNSは無料でHTTPS対応のダイナミックDNSを提供。自宅サーバーや開発環境に最適。

### 4.2 Kubernetesマニフェストの更新

ドメイン情報を各マニフェストに反映：

```bash
# リポジトリ
cd /Users/kengo/projects/household-task-manager-k8s

# 1. Ingress のホスト名更新
# overlays/production/ingress.yaml
spec:
  tls:
  - hosts:
    - household-task-mgr.duckdns.org  # 更新
  rules:
  - host: household-task-mgr.duckdns.org  # 更新

# 2. Backend CORS 設定
# base/backend/configmap.yaml
data:
  CORS_ORIGINS: https://household-task-mgr.duckdns.org  # 更新

# 3. Frontend API URL
# base/frontend/configmap.yaml
data:
  VITE_API_BASE_URL: https://household-task-mgr.duckdns.org/api  # 更新
```

---

## 5. フェーズ2: クラスタの問題診断と再構築

### 5.1 エラー1: Deployment が ReplicaSet を作成しない

#### 症状

```bash
$ kubectl get deployments -n household-task-manager
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
backend    0/2     0            0           10m
frontend   0/2     0            0           10m

$ kubectl get replicasets -n household-task-manager
No resources found in household-task-manager namespace.
```

Deploymentが作成されているのに、ReplicaSetが一つも存在しない異常な状態。

#### 診断手順

```bash
# 1. kube-controller-manager のログ確認
$ kubectl logs -n kube-system kube-controller-manager-rpi-master-1

# 出力例
E1207 15:23:45.123456    1 authentication.go:104] Unable to authenticate the request due to an error: [invalid bearer token, Token has been invalidated]
```

**原因**: kube-controller-managerの認証トークンが無効化されており、Kubernetes APIサーバーと通信できない状態。

#### 根本原因

Kubernetes 1.24以降、ServiceAccountのトークンが自動生成されなくなりました。既存クラスタのアップグレード時に、古いトークンが無効化されたことが原因と推測。

#### 解決策の選択

2つの選択肢を検討：

| 選択肢 | 内容 | メリット | デメリット |
|-------|------|---------|----------|
| A. クラスタ再構築 | kubeadmで初めから構築 | クリーンな状態、確実 | 時間がかかる |
| B. 手動修正 | トークンを手動で作成 | 早い | 根本解決にならない可能性 |

**選択**: オプションA（クラスタ再構築）
**理由**: 本番環境のため、確実性を優先

### 5.2 クラスタの再構築

#### 要件

- etcdデータは**SSD上に配置** (`/mnt/etcd-ssd/etcd`)
- PostgreSQLデータも**SSD上に配置** (`/mnt/ssd-nfs/postgres-data`)

#### 手順

**ステップ1: 全ノードのリセット**

```bash
# 全ノードで実行
ssh rpi-master-1 "sudo kubeadm reset -f"
ssh rpi-worker-1 "sudo kubeadm reset -f"
ssh rpi-worker-2 "sudo kubeadm reset -f"
```

**ステップ2: etcdディレクトリの準備**

```bash
ssh rpi-master-1 "sudo mkdir -p /mnt/etcd-ssd/etcd && sudo chown root:root /mnt/etcd-ssd/etcd"
```

**ステップ3: kubeadm設定ファイルの作成**

```bash
ssh rpi-master-1 "cat > /tmp/kubeadm-config.yaml <<'EOF'
apiVersion: kubeadm.k8s.io/v1beta4
kind: ClusterConfiguration
networking:
  podSubnet: 10.244.0.0/16  # Flannel用
etcd:
  local:
    dataDir: /mnt/etcd-ssd/etcd  # SSD上のディレクトリ
EOF
"
```

**学習ポイント**: kubeadmの設定ファイルでetcdのデータディレクトリをカスタマイズ可能。パフォーマンス向上のため、etcdは必ずSSD上に配置すべき。

**ステップ4: マスターノードの初期化**

```bash
ssh rpi-master-1 "sudo kubeadm init --config /tmp/kubeadm-config.yaml"

# 出力例
Your Kubernetes control-plane has initialized successfully!
...
kubeadm join 192.168.0.200:6443 --token xxxxx.yyyyyy \
    --discovery-token-ca-cert-hash sha256:zzzzz...
```

**ステップ5: kubeconfigの設定**

```bash
ssh rpi-master-1 "mkdir -p ~/.kube && sudo cp /etc/kubernetes/admin.conf ~/.kube/config && sudo chown \$(id -u):\$(id -g) ~/.kube/config"
```

**ステップ6: ワーカーノードのjoin**

```bash
# join コマンドは kubeadm init の出力から取得
ssh rpi-worker-1 "sudo kubeadm join 192.168.0.200:6443 --token xxxxx.yyyyyy --discovery-token-ca-cert-hash sha256:zzzzz..."

ssh rpi-worker-2 "sudo kubeadm join 192.168.0.200:6443 --token xxxxx.yyyyyy --discovery-token-ca-cert-hash sha256:zzzzz..."
```

**ステップ7: ノード確認**

```bash
$ ssh rpi-master-1 "kubectl get nodes"
NAME           STATUS     ROLES           AGE   VERSION
rpi-master-1   NotReady   control-plane   2m    v1.31.13
rpi-worker-1   NotReady   <none>          1m    v1.31.14
rpi-worker-2   NotReady   <none>          1m    v1.31.14
```

STATUS が `NotReady` なのは、まだCNIがインストールされていないため（次のフェーズで解決）。

---

## 6. フェーズ3: CNI初期化問題

### 6.1 エラー2: Nodes が NotReady のまま

#### 症状

Flannel CNIをインストールしたが、5分以上経ってもノードが `NotReady` のまま。

```bash
$ ssh rpi-master-1 "kubectl get nodes"
NAME           STATUS     ROLES           AGE   VERSION
rpi-master-1   NotReady   control-plane   7m    v1.31.13
rpi-worker-1   NotReady   <none>          6m    v1.31.14
rpi-worker-2   NotReady   <none>          6m    v1.31.14

$ ssh rpi-master-1 "kubectl describe node rpi-master-1 | grep -A 5 'Ready'"
  Ready            False   Mon, 07 Dec 2025 15:45:00 +0000   Mon, 07 Dec 2025 15:40:00 +0000   KubeletNotReady   cni plugin not initialized
```

#### 診断手順

```bash
# 1. Flannel Podsの確認
$ ssh rpi-master-1 "kubectl get pods -n kube-flannel"
NAME                    READY   STATUS    RESTARTS   AGE
kube-flannel-ds-7x8wm   1/1     Running   0          6m
kube-flannel-ds-9k2ln   1/1     Running   0          6m
kube-flannel-ds-p4r3s   1/1     Running   0          6m

# 2. CNIバイナリの確認
$ ssh rpi-master-1 "ls /opt/cni/bin/"
bandwidth  dhcp  firewall  flannel  host-device  host-local  ipvlan  loopback  macvlan  portmap  ptp  sbr  static  tuning  vlan  vrf

# 3. CNI設定の確認
$ ssh rpi-master-1 "cat /etc/cni/net.d/10-flannel.conflist"
{
  "name": "cbr0",
  "cniVersion": "0.3.1",
  ...
}
```

Flannel Podsは正常に Running、CNIバイナリも存在、設定ファイルも正常。

#### 原因

containerdがCNIプラグインを正しく認識できていない状態。containerdプロセスの再起動が必要。

#### 解決策

```bash
# 全ノードで containerd を再起動
ssh rpi-master-1 "sudo systemctl restart containerd"
ssh rpi-worker-1 "sudo systemctl restart containerd"
ssh rpi-worker-2 "sudo systemctl restart containerd"

# 1-2分待機
sleep 60

# ノード確認
$ ssh rpi-master-1 "kubectl get nodes"
NAME           STATUS   ROLES           AGE   VERSION
rpi-master-1   Ready    control-plane   10m   v1.31.13
rpi-worker-1   Ready    <none>          9m    v1.31.14
rpi-worker-2   Ready    <none>          9m    v1.31.14
```

**学習ポイント**: CNIの問題はcontainerdやkubeletの再起動で解決することが多い。特に新規クラスタ構築時は、containerdがCNI設定を読み込むタイミングの問題で発生しやすい。

---

## 7. フェーズ4: インフラコンポーネントのセットアップ

### 7.1 cert-manager のインストール

TLS証明書の自動発行・更新を担当。

```bash
# 1. cert-manager のインストール
ssh rpi-master-1 "kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml"

# 2. インストール確認
ssh rpi-master-1 "kubectl get pods -n cert-manager"

# 3. ClusterIssuer の作成
ssh rpi-master-1 "kubectl apply -f - <<'EOF'
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: niwaniwaniwaniwatori.gairuze@gmail.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
"
```

**学習ポイント**: cert-managerはACME(Let's Encrypt)プロトコルを使って自動的にTLS証明書を発行・更新。HTTP-01チャレンジでドメイン所有権を検証。

### 7.2 nginx-ingress-controller のインストール

```bash
ssh rpi-master-1 "kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/baremetal/deploy.yaml"

# hostNetwork モードに変更（ベアメタル環境のため）
ssh rpi-master-1 "kubectl patch deployment ingress-nginx-controller -n ingress-nginx -p '{\"spec\":{\"template\":{\"spec\":{\"hostNetwork\":true}}}}'"
```

**学習ポイント**:
- ベアメタル環境では LoadBalancer Serviceが使えないため、hostNetworkモードを使用
- hostNetwork=true により、ノードの80/443ポートで直接リクエストを受ける

### 7.3 Sealed Secrets のインストール

GitOpsでSecretを安全に管理するため。

```bash
# 1. Sealed Secrets のインストール
ssh rpi-master-1 "kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.26.0/controller.yaml"

# 2. kubeseal CLI のインストール（ローカル）
brew install kubeseal

# 3. 公開鍵の取得
ssh rpi-master-1 "kubectl get secret -n kube-system sealed-secrets-key -o jsonpath='{.data.tls\.crt}' | base64 -d > /tmp/sealed-secrets-pub-cert.pem"
scp rpi-master-1:/tmp/sealed-secrets-pub-cert.pem ~/.kube/sealed-secrets-pub-cert.pem
```

**学習ポイント**:
- Sealed SecretsはSecretを暗号化してGitに安全にコミット可能
- クラスタの秘密鍵でのみ復号化可能（非対称暗号）

### 7.4 Argo CD のインストール

```bash
# 1. Argo CD のインストール
ssh rpi-master-1 "kubectl create namespace argocd"
ssh rpi-master-1 "kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml"

# 2. 初期パスワード取得
ssh rpi-master-1 "kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath='{.data.password}' | base64 -d"
```

### 7.5 local-path-provisioner のインストール

動的にPersistentVolumeを作成するため。

```bash
ssh rpi-master-1 "kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.24/deploy/local-path-storage.yaml"
```

---

## 8. フェーズ5: GitOps設定

### 8.1 SSH Deploy Key の生成

Argo CDがプライベートリポジトリにアクセスするため。

```bash
# 1. SSH鍵ペア生成
ssh-keygen -t ed25519 -C "argocd@household-task-manager" -f ~/.ssh/argocd-deploy-key -N ""

# 2. 公開鍵をGitHubに登録
cat ~/.ssh/argocd-deploy-key.pub
# GitHub Repository → Settings → Deploy keys → Add deploy key

# 3. Argo CD にSecretを作成
ssh rpi-master-1 "kubectl create secret generic argocd-repo-creds -n argocd \
  --from-file=sshPrivateKey=/home/kengo/.ssh/argocd-deploy-key \
  --from-literal=url=git@github.com:Kamegrueon/household-task-manager-k8s.git"

# 4. ラベル追加
ssh rpi-master-1 "kubectl label secret argocd-repo-creds -n argocd argocd.argoproj.io/secret-type=repository"
```

**学習ポイント**:
- Deploy Keyはリポジトリごとに設定するSSH鍵
- リポジトリを public にするより、deploy key を使う方がセキュア

### 8.2 Argo CD Application の作成

```bash
ssh rpi-master-1 "kubectl apply -f - <<'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: household-task-manager
  namespace: argocd
spec:
  project: default
  source:
    repoURL: git@github.com:Kamegrueon/household-task-manager-k8s.git
    targetRevision: HEAD
    path: overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: household-task-manager
  syncPolicy:
    automated:
      prune: true        # 不要なリソース自動削除
      selfHeal: true     # 差分自動修正
    syncOptions:
    - CreateNamespace=true
EOF
"
```

**学習ポイント**:
- `automated` で GitOps の継続的デプロイを実現
- `prune: true` でマニフェストから削除されたリソースも自動削除
- `selfHeal: true` で手動変更を自動で元に戻す

---

## 9. フェーズ6: Kustomize設定のトラブルシューティング

### 9.1 エラー3: bases は非推奨、patches が失敗

#### 症状

```bash
$ ssh rpi-master-1 "kubectl get applications -n argocd household-task-manager"
NAME                      SYNC STATUS   HEALTH STATUS
household-task-manager    OutOfSync     Unknown

# Argo CD のログ
Error: no matches for Id Deployment.v1.apps/backend.[noNs]; failed to find unique target for patch
```

#### 原因

`kustomization.yaml` で古い構文を使用：

```yaml
# overlays/production/kustomization.yaml (問題のある構成)
bases:  # 非推奨
  - ../../base

patchesStrategicMerge:  # パッチ対象が見つからない
  - |-
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: backend
    spec:
      replicas: 2
```

#### 解決策

```yaml
# overlays/production/kustomization.yaml (修正後)
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: household-task-manager

resources:  # bases → resources に変更
  - ../../base
  - ingress-backend.yaml
  - ingress-frontend.yaml

images:
  - name: ghcr.io/kamegrueon/household-task-manager-backend
    newTag: main
  - name: ghcr.io/kamegrueon/household-task-manager-frontend
    newTag: main

# patchesStrategicMerge は削除（base で直接 replicas 指定）
```

**学習ポイント**:
- Kustomize v4以降は `bases` → `resources` に変更
- 不要なパッチは削除し、baseで直接定義する方がシンプル

---

## 10. フェーズ7: PostgreSQL設定

### 10.1 SSDへの永続化設定

#### 要件

PostgreSQLのデータは `rpi-worker-1` のSSD (`/mnt/ssd-nfs/postgres-data`) に保存。

#### PersistentVolume の作成

```yaml
# base/database/pv.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv-ssd
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: local-path
  local:
    path: /mnt/ssd-nfs/postgres-data
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values:
          - rpi-worker-1
```

**学習ポイント**:
- `local` PVは特定のノードにバインド
- `nodeAffinity` でPVが存在するノードを指定
- データベースのような状態を持つアプリには必須

#### StatefulSet の nodeSelector 設定

```yaml
# base/database/statefulset.yaml
spec:
  template:
    spec:
      nodeSelector:
        kubernetes.io/hostname: rpi-worker-1  # 追加
      containers:
      - name: postgres
        image: postgres:16-alpine
        ...
```

**学習ポイント**:
- StatefulSetとPVを同じノードに配置する必要がある
- `nodeSelector` でPodのスケジューリングを制御

### 10.2 エラー4: Secret名の不一致

#### 症状

```bash
$ ssh rpi-master-1 "kubectl get pods -n household-task-manager"
NAME          READY   STATUS                  RESTARTS   AGE
postgres-0    0/1     CreateContainerConfigError   0      1m

$ ssh rpi-master-1 "kubectl describe pod postgres-0 -n household-task-manager"
Warning  Failed     5s (x3 over 20s)  kubelet  Error: secret "postgres-secret" not found
```

#### 原因

StatefulSetが参照している Secret名 (`postgres-secret`) と、実際に作成した Secret名 (`database-secret`) が異なる。

#### 解決策

```yaml
# base/database/statefulset.yaml
spec:
  template:
    spec:
      containers:
      - name: postgres
        envFrom:
        - configMapRef:
            name: postgres-config
        - secretRef:
            name: database-secret  # postgres-secret → database-secret に変更
```

**学習ポイント**:
- Secret/ConfigMap の命名規則を統一
- `kubectl describe pod` でエラー詳細を確認

---

## 11. フェーズ8: データベース接続のトラブルシューティング

### 11.1 エラー5: データベース名の不一致

#### 症状

```bash
$ ssh rpi-master-1 "kubectl logs -n household-task-manager backend-xxx"
alembic.util.exc.CommandError: Can't locate revision identified by '0bcb13197448'
...
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) FATAL:  database "household" does not exist
```

#### 診断

```bash
# PostgreSQL に接続して確認
$ ssh rpi-master-1 "kubectl exec -n household-task-manager postgres-0 -- psql -U postgres -c '\l'"
                                  List of databases
         Name          |  Owner   | Encoding | Collate | Ctype | Access privileges
-----------------------+----------+----------+---------+-------+-------------------
 household_task_manager| postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
 postgres              | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
```

PostgreSQL には `household_task_manager` というデータベースが作成されているが、バックエンドは `household` に接続しようとしている。

#### 原因

ConfigMapでデータベース名を `household_task_manager` に設定しているが、Sealed Secretの接続文字列が `household` になっていた。

```yaml
# base/database/configmap.yaml
data:
  POSTGRES_DB: household_task_manager  # ← こっちが正しい

# base/backend/sealed-secret.yaml (問題)
SUPABASE_DATABASE_URL: postgresql://postgres:PASSWORD@postgres:5432/household  # ← 間違い
```

#### 解決策

Sealed Secretを再作成：

```bash
# 1. 正しい接続文字列でSecretを作成
kubectl create secret generic database-secret \
  --from-literal=SUPABASE_DATABASE_URL="postgresql://postgres:PASSWORD@postgres:5432/household_task_manager" \
  --dry-run=client -o yaml | \
kubeseal --format yaml --cert ~/.kube/sealed-secrets-pub-cert.pem > base/backend/sealed-secret.yaml

# 2. コミット＆プッシュ
git add base/backend/sealed-secret.yaml
git commit -m "fix: correct database name in connection string"
git push
```

**学習ポイント**:
- 環境変数の値は複数の場所で整合性を保つ必要がある
- Sealed Secretの中身は暗号化されているため、値を直接確認できない
- 問題があればSecretを再作成するのが確実

### 11.2 エラー6: 環境変数名の不一致

#### 症状

```bash
$ ssh rpi-master-1 "kubectl logs -n household-task-manager backend-xxx"
ValueError: SUPABASE_DATABASE_URL が設定されていません
```

#### 原因

バックエンドのコードは `SUPABASE_DATABASE_URL` を期待しているが、Secretには `DATABASE_URL` というキーで保存していた。

#### 解決策

正しい環境変数名で Sealed Secret を再作成（前項と同じ手順）。

**学習ポイント**:
- アプリケーションコードと環境変数名を必ず一致させる
- コードレビュー時に環境変数名も確認

---

## 12. フェーズ9: 外部アクセス設定

### 12.1 ルーターのポートフォワーディング設定

自宅ルーターで以下を設定：

```
外部ポート: 80  → 内部IP: 192.168.0.202 (rpi-master-1)  ポート: 80
外部ポート: 443 → 内部IP: 192.168.0.202 (rpi-master-1)  ポート: 443
```

**学習ポイント**:
- ingress-nginx は hostNetwork で全ノードの 80/443 ポートをリッスン
- いずれかのノードにポートフォワーディングすればOK

### 12.2 Let's Encrypt TLS証明書の自動発行

Ingress に cert-manager のアノテーションを追加：

```yaml
# overlays/production/ingress.yaml
metadata:
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - household-task-mgr.duckdns.org
    secretName: household-task-manager-tls
```

証明書の発行確認：

```bash
$ ssh rpi-master-1 "kubectl get certificate -n household-task-manager"
NAME                         READY   SECRET                       AGE
household-task-manager-tls   True    household-task-manager-tls   2m

$ ssh rpi-master-1 "kubectl describe certificate household-task-manager-tls -n household-task-manager"
Events:
  Type    Reason     Age   From          Message
  ----    ------     ----  ----          -------
  Normal  Issuing    2m    cert-manager  Issuing certificate as Secret does not exist
  Normal  Generated  2m    cert-manager  Stored new private key in temporary Secret resource
  Normal  Requested  2m    cert-manager  Created new CertificateRequest resource "household-task-manager-tls-1"
  Normal  Issued     1m    cert-manager  Certificate issued successfully
```

**学習ポイント**:
- cert-manager が自動的に ACME HTTP-01 チャレンジを実行
- 証明書は90日で自動更新される
- Secretに証明書が保存され、Ingressが自動的に使用

### 12.3 動作確認

```bash
$ curl -I https://household-task-mgr.duckdns.org
HTTP/2 200
date: Sun, 07 Dec 2025 18:30:00 GMT
content-type: text/html
strict-transport-security: max-age=31536000; includeSubDomains
```

HTTPS でアクセス成功！

---

## 13. フェーズ10: Mixed Contentエラーの解決

### 13.1 エラー7: HTTPS ページから HTTP API へのアクセス

#### 症状

ブラウザのコンソールに以下のエラー：

```
Mixed Content: The page at 'https://household-task-mgr.duckdns.org/register' was loaded over HTTPS,
but requested an insecure XMLHttpRequest endpoint 'http://backend:8000/auth/register/'.
This request has been blocked; the content must be served over HTTPS.
```

#### 原因

フロントエンドが `http://backend:8000` という内部サービス名でAPIにアクセスしようとしている。これは Vite のビルド時に埋め込まれた環境変数。

#### 診断

```bash
# GitHub Actions の設定確認
$ cat .github/workflows/build-and-push.yml | grep -A 5 "build-args"
build-args: |
  VITE_API_BASE_URL=${{ secrets.VITE_API_BASE_URL || 'http://backend:8000' }}
```

`VITE_API_BASE_URL` が設定されていないため、デフォルト値の `http://backend:8000` が使われている。

#### 解決策

GitHub Actions のワークフローを修正：

```yaml
# .github/workflows/build-and-push.yml
- name: Build and push Frontend image
  uses: docker/build-push-action@v5
  with:
    context: ./frontend
    file: ./frontend/Dockerfile
    platforms: linux/arm64
    push: ${{ github.event_name != 'pull_request' }}
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    build-args: |
      VITE_API_BASE_URL=https://household-task-mgr.duckdns.org/api  # 修正
```

コミット＆プッシュ後、GitHub Actionsが自動的に新しいイメージをビルド。

**学習ポイント**:
- Vite は **ビルド時** に環境変数を埋め込む（実行時ではない）
- Mixed Content エラーは HTTPS ページから HTTP リソースを読み込むと発生
- フロントエンドは公開URLでAPIにアクセスする必要がある

### 13.2 フロントエンドのデプロイ

```bash
# 新しいイメージがビルドされたことを確認
$ gh run list --repo Kamegrueon/household-task-manager --limit 1
STATUS  NAME                           WORKFLOW                 BRANCH  EVENT  ID          ELAPSED  AGE
✓       Build and Push Container...    Build and Push Contai... main    push   123456789   4m49s    2m

# フロントエンドPodを再起動（新しいイメージをプル）
$ ssh rpi-master-1 "kubectl rollout restart deployment/frontend -n household-task-manager"
$ ssh rpi-master-1 "kubectl rollout status deployment/frontend -n household-task-manager"
deployment "frontend" successfully rolled out
```

---

## 14. フェーズ11: JavaScript MIME typeエラーの解決

### 14.1 エラー8: JavaScript モジュールが text/html で配信

#### 症状

ブラウザのコンソールに以下のエラー：

```
Failed to load module script: Expected a JavaScript module script but the server
responded with a MIME type of "text/html". Strict MIME type checking is enforced
for module scripts per HTML spec.
```

#### 診断手順

**ステップ1: ファイルの存在確認**

```bash
# Podの中身を確認
$ ssh rpi-master-1 "kubectl exec -n household-task-manager frontend-xxx -- ls -la /usr/share/nginx/html/assets/"
-rw-r--r-- 1 root root 792039 Dec  7 23:25 index-CHNmygpH.js
-rw-r--r-- 1 root root  31155 Dec  7 23:25 index-D2_9gLdb.css
-rw-r--r-- 1 root root   1296 Dec  7 23:25 logo-BF2t4zGx.svg
```

ファイルは存在する。

**ステップ2: Pod内で直接アクセス**

```bash
$ ssh rpi-master-1 "kubectl exec -n household-task-manager frontend-xxx -- curl -I http://localhost:80/assets/index-CHNmygpH.js"
HTTP/1.1 200 OK
Content-Type: application/javascript  # ← 正しい！
```

Pod内からのアクセスは正常。

**ステップ3: Ingress経由でアクセス**

```bash
$ curl -I https://household-task-mgr.duckdns.org/assets/index-CHNmygpH.js
HTTP/2 200
content-type: text/html  # ← 間違っている！
content-length: 472      # ← index.html のサイズ
```

Ingress を経由すると MIME type が間違っている。

#### 原因

単一の Ingress リソースに `rewrite-target: /$2` アノテーションを設定していたため、**全てのパス** に適用されていた。

```yaml
# overlays/production/ingress.yaml (問題のある構成)
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2  # グローバルに適用
spec:
  rules:
  - host: household-task-mgr.duckdns.org
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: backend
            port:
              number: 8000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

`/assets/index-CHNmygpH.js` へのリクエスト：
1. `/` パスにマッチ
2. `rewrite-target: /$2` が適用される
3. `/` パスには正規表現キャプチャグループがないため、`$2` は空文字列
4. リクエストが `/` (ルート) に書き換えられる
5. Nginx が `index.html` を返す

#### 解決策

Backend と Frontend で **別々の Ingress** を作成：

```yaml
# overlays/production/ingress-backend.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: household-task-manager-backend
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /$2  # Backend のみに適用
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - household-task-mgr.duckdns.org
    secretName: household-task-manager-tls
  rules:
  - host: household-task-mgr.duckdns.org
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: backend
            port:
              number: 8000
```

```yaml
# overlays/production/ingress-frontend.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: household-task-manager-frontend
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    # rewrite-target なし
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - household-task-mgr.duckdns.org
    secretName: household-task-manager-tls
  rules:
  - host: household-task-mgr.duckdns.org
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

```yaml
# overlays/production/kustomization.yaml
resources:
  - ../../base
  - ingress-backend.yaml   # 追加
  - ingress-frontend.yaml  # 追加
```

#### 動作確認

```bash
$ curl -I https://household-task-mgr.duckdns.org/assets/index-CHNmygpH.js
HTTP/2 200
content-type: application/javascript  # ← 修正された！
content-length: 792039

$ curl -I https://household-task-mgr.duckdns.org/api/docs
HTTP/2 200
content-type: text/html; charset=utf-8  # ← Backend API も正常
```

**学習ポイント**:
- nginx ingress のアノテーションは Ingress リソース全体に適用される
- 異なるパスに異なる設定が必要な場合は、Ingress を分離する
- Path rewriting は慎重に設計する（意図しないリクエストまで書き換わる可能性）

### 14.2 ブラウザキャッシュのクリア

修正後もエラーが出る場合は、ブラウザキャッシュが原因：

```bash
# ハードリフレッシュ
Mac: Cmd + Shift + R
Windows/Linux: Ctrl + Shift + F5

# または、シークレットモード/プライベートブラウジングで確認
```

**学習ポイント**:
- ブラウザは古いレスポンスヘッダーをキャッシュすることがある
- 開発中は DevTools の "Disable cache" を有効にすると便利

---

## 15. フェーズ12: 本番データの移行

### 15.1 データベースダンプの確認

```bash
$ file /Users/kengo/projects/household-task-manager/db.dump
/Users/kengo/projects/household-task-manager/db.dump: PostgreSQL custom database dump - v1.14-0
```

PostgreSQL カスタムフォーマット（`pg_dump -Fc`）のダンプファイル。

### 15.2 ダンプファイルの転送

```bash
# 1. マスターノードにコピー
$ scp /Users/kengo/projects/household-task-manager/db.dump rpi-master-1:/tmp/db.dump

# 2. PostgreSQL Pod にコピー
$ ssh rpi-master-1 "kubectl cp /tmp/db.dump household-task-manager/postgres-0:/tmp/db.dump"

# 3. 転送確認
$ ssh rpi-master-1 "kubectl exec -n household-task-manager postgres-0 -- ls -lh /tmp/db.dump"
-rw-r--r-- 1 1000 1003 253.7K Dec  8 13:27 /tmp/db.dump
```

### 15.3 ダンプ内容の確認

```bash
$ ssh rpi-master-1 "kubectl exec -n household-task-manager postgres-0 -- pg_restore --list /tmp/db.dump | grep 'TABLE DATA public'"
4144; 0 17626 TABLE DATA public alembic_version postgres
4145; 0 17629 TABLE DATA public project_members postgres
4147; 0 17635 TABLE DATA public projects postgres
4149; 0 17641 TABLE DATA public refresh_tokens postgres
4151; 0 17647 TABLE DATA public task_executions postgres
4153; 0 17651 TABLE DATA public tasks postgres
4155; 0 17657 TABLE DATA public users postgres
```

### 15.4 現在のデータベース確認

```bash
$ ssh rpi-master-1 "kubectl exec -n household-task-manager postgres-0 -- psql -U postgres -d household_task_manager -c '\dt'"
              List of relations
 Schema |      Name       | Type  |  Owner
--------+-----------------+-------+----------
 public | alembic_version | table | postgres
 public | project_members | table | postgres
 public | projects        | table | postgres
 public | refresh_tokens  | table | postgres
 public | task_executions | table | postgres
 public | tasks           | table | postgres
 public | users           | table | postgres
```

スキーマは既に Alembic migration で作成済み。

### 15.5 データのリストア

**ステップ1: 既存データのクリア**

```bash
$ ssh rpi-master-1 "kubectl exec -n household-task-manager postgres-0 -- psql -U postgres -d household_task_manager -c 'TRUNCATE TABLE users, projects, tasks, task_executions, project_members, refresh_tokens, alembic_version CASCADE;'"
TRUNCATE TABLE
```

**ステップ2: データのリストア**

```bash
$ ssh rpi-master-1 "kubectl exec -n household-task-manager postgres-0 -- pg_restore -U postgres -d household_task_manager --data-only --schema=public --disable-triggers /tmp/db.dump"
```

オプション説明：
- `--data-only`: スキーマは復元せず、データのみ
- `--schema=public`: public スキーマのみ（auth スキーマを除外）
- `--disable-triggers`: 外部キー制約を一時的に無効化

**ステップ3: データ確認**

```bash
$ ssh rpi-master-1 "kubectl exec -n household-task-manager postgres-0 -- psql -U postgres -d household_task_manager -c \"
SELECT 'users' as table_name, COUNT(*) FROM users UNION ALL
SELECT 'projects', COUNT(*) FROM projects UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks UNION ALL
SELECT 'task_executions', COUNT(*) FROM task_executions UNION ALL
SELECT 'project_members', COUNT(*) FROM project_members UNION ALL
SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens;
\""

   table_name    | count
-----------------+-------
 users           |     3
 projects        |     3
 tasks           |    66
 task_executions |   790
 project_members |     5
 refresh_tokens  |   426
```

### 15.6 クリーンアップ

```bash
$ ssh rpi-master-1 "kubectl exec -n household-task-manager postgres-0 -- rm /tmp/db.dump"
$ ssh rpi-master-1 "rm /tmp/db.dump"
```

**学習ポイント**:
- `pg_restore` の `--data-only` でデータのみを復元
- `--disable-triggers` で外部キー制約の問題を回避
- 本番環境では必ず事前バックアップを取る

---

## 16. ベストプラクティスと学び

### 16.1 GitOps のメリット

| 項目 | 従来の手法 | GitOps |
|-----|----------|--------|
| **デプロイ** | `kubectl apply` を手動実行 | Git push で自動デプロイ |
| **変更履歴** | 不明瞭 | Git history で完全追跡 |
| **ロールバック** | 手動で前の状態を復元 | `git revert` で自動復元 |
| **レビュー** | 困難 | Pull Request でレビュー可能 |
| **同期** | 手動確認 | Argo CD が自動検知 |

### 16.2 Sealed Secrets によるシークレット管理

**従来の問題点**:
- Secret を Git にコミットできない（平文）
- 手動で `kubectl create secret` が必要
- チーム間で Secret を共有しづらい

**Sealed Secrets の利点**:
- ✅ 暗号化された Secret を Git にコミット可能
- ✅ クラスタの秘密鍵でのみ復号化可能
- ✅ GitOps ワークフローに完全統合

**使用例**:

```bash
# 1. Secret作成（ローカル）
kubectl create secret generic my-secret \
  --from-literal=password=supersecret \
  --dry-run=client -o yaml | \
kubeseal --format yaml --cert ~/.kube/sealed-secrets-pub-cert.pem > sealed-secret.yaml

# 2. Git にコミット
git add sealed-secret.yaml
git commit -m "add sealed secret"
git push

# 3. Argo CD が自動デプロイ → Sealed Secrets Controller が自動復号化
```

### 16.3 Ingress 設計のポイント

#### パターン1: 単一 Ingress（シンプル）

```yaml
# 適用例: 全てのパスで同じ設定を使う場合
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /api
        backend:
          service:
            name: backend
      - path: /
        backend:
          service:
            name: frontend
```

#### パターン2: 複数 Ingress（柔軟）

```yaml
# 適用例: パスごとに異なる設定が必要な場合
# Ingress 1: Backend（path rewriting あり）
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: example.com
    paths:
    - path: /api(/|$)(.*)

---
# Ingress 2: Frontend（path rewriting なし）
spec:
  rules:
  - host: example.com
    paths:
    - path: /
```

**推奨**: パスごとに設定が異なる場合は複数 Ingress を使用。

### 16.4 トラブルシューティングのアプローチ

#### レイヤーごとの診断

```
Layer 7: Application
  ↓ kubectl logs pod-name

Layer 6: Ingress
  ↓ kubectl describe ingress
  ↓ curl -I https://domain/path

Layer 5: Service
  ↓ kubectl get endpoints
  ↓ kubectl exec pod -- curl service:port

Layer 4: Pod
  ↓ kubectl describe pod
  ↓ kubectl get pod -o yaml

Layer 3: Node
  ↓ kubectl describe node
  ↓ kubectl get nodes

Layer 2: CNI
  ↓ kubectl get pods -n kube-system
  ↓ systemctl status containerd
```

#### よくあるエラーと対処法

| エラー | 原因候補 | 確認コマンド |
|-------|---------|------------|
| Pod が Pending | リソース不足、PV未バインド | `kubectl describe pod` |
| Pod が CrashLoopBackOff | アプリエラー、環境変数ミス | `kubectl logs pod` |
| Service に接続できない | Selector ミスマッチ | `kubectl get endpoints` |
| Ingress が 404 | パス設定ミス | `kubectl describe ingress` |
| TLS証明書エラー | cert-manager の問題 | `kubectl describe certificate` |

### 16.5 ストレージのベストプラクティス

| データタイプ | 推奨ストレージ | 理由 |
|------------|--------------|------|
| **etcd** | SSD（必須） | ランダムI/Oが多い |
| **データベース** | SSD（推奨） | 性能と耐久性 |
| **ログ** | HDD可 | シーケンシャル書き込み |
| **静的アセット** | HDD可 | 読み取りメイン |

**今回の構成**:
- etcd: `/mnt/etcd-ssd/etcd` (SSD)
- PostgreSQL: `/mnt/ssd-nfs/postgres-data` (SSD)

### 16.6 セキュリティのベストプラクティス

- ✅ Secret は Sealed Secrets で暗号化
- ✅ HTTPS 必須（Mixed Content を防ぐ）
- ✅ CORS を適切に設定
- ✅ プライベートリポジトリは Deploy Key を使用
- ✅ Let's Encrypt で TLS 証明書を自動更新
- ⚠️ Network Policy でPod間通信を制限（未実施）
- ⚠️ Pod Security Standards の適用（未実施）

---

## 17. 付録

### 17.1 よく使うコマンド集

#### クラスタ管理

```bash
# ノード確認
kubectl get nodes -o wide

# 全リソース確認
kubectl get all -n namespace-name

# リソース詳細
kubectl describe pod/deployment/service/ingress resource-name -n namespace

# ログ確認
kubectl logs pod-name -n namespace
kubectl logs -f pod-name -n namespace  # follow mode

# Pod 内でコマンド実行
kubectl exec -it pod-name -n namespace -- bash
kubectl exec pod-name -n namespace -- command

# リソース削除
kubectl delete pod/deployment/service resource-name -n namespace
```

#### Argo CD

```bash
# Application 確認
kubectl get applications -n argocd

# Application の詳細
kubectl describe application app-name -n argocd

# 手動同期
kubectl patch application app-name -n argocd -p '{"operation":{"sync":{"revision":"HEAD"}}}' --type merge

# Argo CD UI へのアクセス
kubectl port-forward svc/argocd-server -n argocd 8080:443
# https://localhost:8080
```

#### データベース操作

```bash
# PostgreSQL に接続
kubectl exec -it postgres-0 -n namespace -- psql -U postgres -d database_name

# SQL 実行（ワンライナー）
kubectl exec postgres-0 -n namespace -- psql -U postgres -d database_name -c "SELECT * FROM users;"

# テーブル一覧
kubectl exec postgres-0 -n namespace -- psql -U postgres -d database_name -c '\dt'

# データベースバックアップ
kubectl exec postgres-0 -n namespace -- pg_dump -U postgres -d database_name -Fc > backup.dump

# データベースリストア
kubectl cp backup.dump namespace/postgres-0:/tmp/backup.dump
kubectl exec postgres-0 -n namespace -- pg_restore -U postgres -d database_name /tmp/backup.dump
```

#### Sealed Secrets

```bash
# Secret を Sealed Secret に変換
kubectl create secret generic my-secret \
  --from-literal=key=value \
  --dry-run=client -o yaml | \
kubeseal --format yaml --cert cert.pem > sealed-secret.yaml

# Sealed Secret から Secret を取得（復号化）
kubectl get secret my-secret -o jsonpath='{.data.key}' | base64 -d
```

### 17.2 トラブルシューティングチェックリスト

#### Pod が起動しない

- [ ] `kubectl describe pod` でイベント確認
- [ ] `kubectl logs pod` でログ確認
- [ ] イメージが正しいか確認（`kubectl get pod -o yaml`）
- [ ] Secret/ConfigMap が存在するか確認
- [ ] リソース制限に引っかかっていないか確認
- [ ] PVC がバインドされているか確認（StatefulSet の場合）

#### Service に接続できない

- [ ] Service の Selector が正しいか確認
- [ ] `kubectl get endpoints` で Pod がバインドされているか確認
- [ ] Pod が Running か確認
- [ ] Service のポート番号が正しいか確認
- [ ] NetworkPolicy で通信が許可されているか確認

#### Ingress が機能しない

- [ ] Ingress Controller が起動しているか確認
- [ ] `kubectl describe ingress` でイベント確認
- [ ] ホスト名が正しいか確認
- [ ] パス設定が正しいか確認
- [ ] Service が存在するか確認
- [ ] TLS証明書が発行されているか確認（`kubectl get certificate`）

#### データベース接続エラー

- [ ] PostgreSQL Pod が Running か確認
- [ ] 接続文字列（DATABASE_URL）が正しいか確認
- [ ] データベース名が正しいか確認
- [ ] ユーザー名・パスワードが正しいか確認
- [ ] Service 名が正しいか確認（通常は `postgres`）
- [ ] ポート番号が正しいか確認（デフォルト 5432）

### 17.3 参考リンク

#### 公式ドキュメント

- [Kubernetes公式ドキュメント](https://kubernetes.io/docs/)
- [kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/)
- [Argo CD](https://argo-cd.readthedocs.io/)
- [cert-manager](https://cert-manager.io/docs/)
- [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)
- [nginx-ingress-controller](https://kubernetes.github.io/ingress-nginx/)
- [Kustomize](https://kustomize.io/)

#### ツール

- [kubectl チートシート](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [GitHub CLI (gh)](https://cli.github.com/)
- [kubeseal](https://github.com/bitnami-labs/sealed-secrets#usage)

#### コミュニティ

- [Kubernetes Slack](https://slack.k8s.io/)
- [CNCF Landscape](https://landscape.cncf.io/)

---

## まとめ

本ドキュメントでは、Raspberry Pi Kubernetesクラスタへのアプリケーションデプロイを、実際に発生したエラーと解決策を含めて詳細に記録しました。

**主な学び**:
1. **GitOps** により、宣言的でトレース可能なデプロイを実現
2. **Sealed Secrets** で Secret を安全に Git 管理
3. **Ingress の設計** はパスごとの要件を考慮して分離
4. **トラブルシューティング** はレイヤーごとに診断
5. **ストレージ** は用途に応じて適切に選択（etcd/DB は SSD）

このガイドが、あなたの Kubernetes 学習とインフラ運用の助けになれば幸いです。

---

**作成者**: Claude Code
**最終更新**: 2025年12月8日

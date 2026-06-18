pipeline {
    agent any

    environment {
        DOCKERHUB_REPO = 'eduardosousa1493/ai-study-buddy'
        IMAGE_TAG = "v${BUILD_NUMBER}"
        GIT_REPO_URL = 'https://github.com/EduardoSantosSousa/AI-Study-Buddy.git'
        GIT_BRANCH = 'main'
        ARGOCD_SERVER = '35.255.23.152:31704'
        ARGOCD_APP = 'ai-study-buddy'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: "*/${GIT_BRANCH}"]],
                    extensions: [[
                        $class: 'LocalBranch',
                        localBranch: "${GIT_BRANCH}"
                    ]],
                    userRemoteConfigs: [[
                        credentialsId: 'github-token',
                        url: "${GIT_REPO_URL}"
                    ]]
                )
            }
        }

        stage('Install Python Dependencies') {
            steps {
                sh '''
                    python --version
                    python -m venv .venv
                    . .venv/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                    pip install pytest httpx jinja2 uvicorn
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                    . .venv/bin/activate
                    export PYTHONPATH="$WORKSPACE:$PYTHONPATH"
                    python -m pytest
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build -t ${DOCKERHUB_REPO}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-token',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_PASSWORD'
                )]) {
                    sh '''
                        echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
                        docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Sync Git Branch') {
            steps {
                sh '''
                    git fetch origin ${GIT_BRANCH}
                    git checkout -B ${GIT_BRANCH} origin/${GIT_BRANCH}
                '''
            }
        }

        stage('Update Kubernetes Image Tag') {
            steps {
                sh '''
                    sed -i "s|image: ${DOCKERHUB_REPO}:.*|image: ${DOCKERHUB_REPO}:${IMAGE_TAG}|g" manifests/deployment.yaml
                    cat manifests/deployment.yaml
                '''
            }
        }

        stage('Commit Manifest Update') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-token',
                    usernameVariable: 'GITHUB_USERNAME',
                    passwordVariable: 'GITHUB_TOKEN'
                )]) {
                    sh '''
                        git config user.email "eduardosousa.eds@gmail.com"
                        git config user.name "EduardoSantosSousa"

                        git add manifests/deployment.yaml
                        git commit -m "Update image tag to ${IMAGE_TAG}" || echo "No manifest changes to commit"

                        git push https://${GITHUB_USERNAME}:${GITHUB_TOKEN}@github.com/EduardoSantosSousa/AI-Study-Buddy.git HEAD:${GIT_BRANCH}
                    '''
                }
            }
        }

        stage('Install kubectl and ArgoCD CLI') {
            steps {
                sh '''
                    if ! command -v kubectl >/dev/null 2>&1; then
                        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
                        chmod +x kubectl
                        mv kubectl /usr/local/bin/kubectl
                    fi

                    if ! command -v argocd >/dev/null 2>&1; then
                        curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
                        chmod +x argocd
                        mv argocd /usr/local/bin/argocd
                    fi
                '''
            }
        }

        stage('Sync ArgoCD') {
            steps {
                withCredentials([string(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_CONTENT')]) {
                    sh '''
                        set -e

                        KUBECONFIG_FILE="$(mktemp)"
                        printf '%b' "$KUBECONFIG_CONTENT" > "$KUBECONFIG_FILE"
                        chmod 600 "$KUBECONFIG_FILE"
                        export KUBECONFIG="$KUBECONFIG_FILE"

                        kubectl config view --minify >/dev/null

                        ARGOCD_PASSWORD=$(kubectl get secret -n argocd argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

                        argocd login ${ARGOCD_SERVER} \
                            --username admin \
                            --password "$ARGOCD_PASSWORD" \
                            --insecure

                        argocd app sync ${ARGOCD_APP}

                        rm -f "$KUBECONFIG_FILE"
                    '''
                }
            }
        }
    }

    post {
        always {
            sh '''
                docker logout || true
            '''
        }
    }
}

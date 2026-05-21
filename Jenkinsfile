pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'eshakhan3870'
        IMAGE_NAME     = 'todo-app'
        IMAGE_TAG      = "${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER}"
        IMAGE_LATEST   = "${DOCKERHUB_USER}/${IMAGE_NAME}:latest"
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Code Fetch') {
            steps {
                echo 'Fetching source code from GitHub...'
                git branch: 'main',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/EshaKhan-ek/todo-app.git'
                sh 'ls -la'
            }
        }

        stage('Docker Image Creation') {
            steps {
                script {
                    sh "docker build -t ${IMAGE_TAG} -t ${IMAGE_LATEST} ."
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                        sh "docker push ${IMAGE_TAG}"
                        sh "docker push ${IMAGE_LATEST}"
                        sh 'docker logout'
                    }
                }
            }
        }

        stage('Kubernetes Deployment') {
            steps {
                script {
                    sh 'kubectl apply -f k8s/mongo.yaml'
                    sh 'kubectl rollout status statefulset/mongo --timeout=120s'
                    sh 'kubectl apply -f k8s/deployment.yaml'
                    sh 'kubectl apply -f k8s/service.yaml'
                    sh 'kubectl rollout status deployment/todo-app --timeout=180s'
                    sh 'kubectl get pods,svc -o wide'
                }
            }
        }

        stage('Prometheus/Grafana Setup') {
            steps {
                script {
                    sh 'kubectl apply -f k8s/monitoring.yaml'
                    sh 'kubectl rollout status deployment/prometheus --timeout=120s'
                    sh 'kubectl rollout status deployment/grafana --timeout=120s'
                    sh 'kubectl get pods,svc | grep -E "prometheus|grafana"'
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline SUCCESS - Build #${BUILD_NUMBER}"
        }
        failure {
            sh 'kubectl get events --sort-by=.metadata.creationTimestamp | tail -20'
        }
        always {
            sh "docker rmi ${IMAGE_TAG} || true"
            sh "docker rmi ${IMAGE_LATEST} || true"
            cleanWs()
        }
    }
}

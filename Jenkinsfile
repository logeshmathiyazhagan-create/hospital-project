pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "logeshwaranm29/hospital-frontend"
        BACKEND_IMAGE  = "logeshwaranm29/hospital-backend"
        TAG            = "latest"
        ENV_FILE       = "/var/lib/jenkins/jobs/Hospital-Project/workspace/backend/.env"
    }

    stages {

        // =========================================================
        // 1. CHECKOUT SOURCE CODE
        // =========================================================
        stage('Checkout Source') {
            steps {
                echo "===== Checking out source code ====="

                git branch: 'main',
                    url: 'https://github.com/logeshmathiyazhagan-create/hospital-project.git'
            }
        }


        // =========================================================
        // 2. BUILD FRONTEND IMAGE
        // =========================================================
        stage('Build Frontend Docker Image') {
            steps {
                echo "===== Building Frontend Docker Image ====="

                script {
                    frontendImage = docker.build(
                        "${FRONTEND_IMAGE}:${TAG}",
                        "./frontend"
                    )
                }
            }
        }


        // =========================================================
        // 3. BUILD BACKEND IMAGE
        // =========================================================
        stage('Build Backend Docker Image') {
            steps {
                echo "===== Building Backend Docker Image ====="

                script {
                    backendImage = docker.build(
                        "${BACKEND_IMAGE}:${TAG}",
                        "./backend"
                    )
                }
            }
        }


        // =========================================================
        // 4. DOCKER HUB LOGIN
        // =========================================================
        stage('DockerHub Login') {
            steps {
                echo "===== Logging into Docker Hub ====="

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credential',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login \
                            -u "$DOCKER_USER" \
                            --password-stdin
                    '''
                }
            }
        }


        // =========================================================
        // 5. PUSH FRONTEND IMAGE
        // =========================================================
        stage('Push Frontend Image') {
            steps {
                echo "===== Pushing Frontend Image ====="

                script {
                    frontendImage.push("${TAG}")
                }
            }
        }


        // =========================================================
        // 6. PUSH BACKEND IMAGE
        // =========================================================
        stage('Push Backend Image') {
            steps {
                echo "===== Pushing Backend Image ====="

                script {
                    backendImage.push("${TAG}")
                }
            }
        }


        // =========================================================
        // 7. DEPLOY CONTAINERS
        // =========================================================
        stage('Deploy Container') {
            steps {

                sh '''
                    echo "======================================"
                    echo "       STARTING DEPLOYMENT"
                    echo "======================================"

                    echo "===== Checking Docker Network ====="

                    docker network inspect hospital-network >/dev/null 2>&1 || \
                    docker network create hospital-network


                    echo "===== Checking Environment File ====="

                    if [ ! -f "${ENV_FILE}" ]; then
                        echo "ERROR: Backend environment file not found!"
                        echo "Expected file: ${ENV_FILE}"
                        exit 1
                    fi

                    echo "Backend .env file found."


                    echo "===== Stopping Old Frontend Container ====="

                    docker stop hospital-frontend || true
                    docker rm hospital-frontend || true


                    echo "===== Stopping Old Backend Container ====="

                    docker stop hospital-backend || true
                    docker rm hospital-backend || true


                    echo "===== Pulling Latest Frontend Image ====="

                    docker pull ${FRONTEND_IMAGE}:${TAG}


                    echo "===== Pulling Latest Backend Image ====="

                    docker pull ${BACKEND_IMAGE}:${TAG}


                    echo "===== Starting Backend Container ====="

                    docker run -d \
                        --name hospital-backend \
                        --network hospital-network \
                        --env-file "${ENV_FILE}" \
                        -p 3000:3000 \
                        --restart unless-stopped \
                        ${BACKEND_IMAGE}:${TAG}


                    echo "===== Starting Frontend Container ====="

                    docker run -d \
                        --name hospital-frontend \
                        --network hospital-network \
                        -p 80:80 \
                        --restart unless-stopped \
                        ${FRONTEND_IMAGE}:${TAG}


                    echo "===== Deployment Completed ====="

                    docker ps
                '''
            }
        }


        // =========================================================
        // 8. VERIFY DEPLOYMENT
        // =========================================================
        stage('Verify Deployment') {
            steps {

                sh '''
                    echo "======================================"
                    echo "       DEPLOYMENT VERIFICATION"
                    echo "======================================"


                    echo ""
                    echo "===== Running Containers ====="

                    docker ps --filter "name=hospital-backend"
                    docker ps --filter "name=hospital-frontend"


                    echo ""
                    echo "===== Backend Environment ====="

                    docker exec hospital-backend sh -c '
                        echo "DB_HOST=$DB_HOST"
                        echo "DB_PORT=$DB_PORT"
                        echo "DB_NAME=$DB_NAME"
                        echo "DB_USER=$DB_USER"
                    '


                    echo ""
                    echo "===== Backend Logs ====="

                    docker logs --tail 30 hospital-backend || true


                    echo ""
                    echo "===== Frontend Logs ====="

                    docker logs --tail 30 hospital-frontend || true


                    echo ""
                    echo "===== Backend Health Check ====="

                    sleep 5

                    curl -f http://localhost:3000/api/health

                    echo ""
                    echo "===== Backend Health Check Successful ====="
                '''
            }
        }
    }


    // =============================================================
    // POST ACTIONS
    // =============================================================
    post {

        success {
            echo "======================================"
            echo "   HOSPITAL DEPLOYMENT SUCCESSFUL"
            echo "======================================"
        }

        failure {
            echo "======================================"
            echo "     HOSPITAL PIPELINE FAILED"
            echo "======================================"

            sh '''
                echo "===== Backend Container Status ====="
                docker ps -a --filter "name=hospital-backend" || true

                echo "===== Backend Logs ====="
                docker logs --tail 50 hospital-backend || true

                echo "===== Frontend Container Status ====="
                docker ps -a --filter "name=hospital-frontend" || true
            '''
        }

        always {
            sh '''
                docker logout || true
            '''
        }
    }
}
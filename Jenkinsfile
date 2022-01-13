pipeline {
  agent {
    docker {
      image 'electronuserland/builder:wine'
      args '-u 0:0'
    }

  }
  stages {
    stage('Build Windows') {
      steps {
          sh 'mkdir npm-cache'
          sh 'npm install --cache npm-cache'
          sh 'npm prod'
          sh 'npm build:win'

      }
    }
  }
  post {
    always {
      sh "chmod -R a+rw \$PWD/"
    }
  }
}

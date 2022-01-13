pipeline {
  agent {
    docker {
      image 'electronuserland/builder:wine'
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
}

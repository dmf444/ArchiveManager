pipeline {
  agent {
    docker {
      image 'electronuserland/builder:wine'
    }

  }
  stages {
    stage('Build Windows') {
      steps {
          sh 'npm install'
          sh 'npm prod'
          sh 'npm build:win'

      }
    }

  }
}

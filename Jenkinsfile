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
        sh 'rm package-lock.json'
        sh 'npm install'
        sh 'npm run verup'
        sh 'npm run prod'
        sh 'npm run build:win'
      }
    }

    stage('Artifact') {
      steps {
        archiveArtifacts 'out/*.exe, out/*.exe.blockmap, out/*.yml'
        archiveArtifacts(artifacts: 'out/*.yaml', allowEmptyArchive: true)
      }
    }

  }
  post {
    always {
      sh 'chmod -R a+rw $PWD/'
    }

  }
}
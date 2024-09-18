pipeline {
  agent {
    docker {
      image 'electronuserland/builder:18-wine-07.24'
      args '-u 0:0'
    }

  }
  stages {
    stage('Build Windows') {
      steps {
        sh 'rm package-lock.json'
        sh 'npm run setup'
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
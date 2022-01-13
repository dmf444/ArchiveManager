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
          sh 'npm install'
          sh 'npm run prod'
          sh 'npm run build:win'
      }
    }
    stage('Artifact') {
      steps {
        archiveArtifacts './out/*.exe'
        archiveArtifacts './out/*.exe.blockmap'
        archiveArtifacts './out/*.yml'
        archiveArtifacts './out/*.yaml'
      }
    }
  }
  post {
    always {
      sh "chmod -R a+rw \$PWD/"
    }
  }
}

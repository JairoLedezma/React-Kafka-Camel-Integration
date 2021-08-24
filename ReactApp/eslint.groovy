stage('Test') {
  steps {
    script {
      sh 'npm run lint'
    }
  }
  post {
    always {
      // Warnings Next Generation Plugin
      // https://jenkins.io/doc/pipeline/steps/warnings-ng/
      // https://github.com/jenkinsci/warnings-ng-plugin/blob/master/doc/Documentation.md
      // https://github.com/jenkinsci/warnings-ng-plugin/blob/master/SUPPORTED-FORMATS.md
      recordIssues enabledForFailure: true, tools: [esLint()]
      recordIssues enabledForFailure: true, tool: esLint()
      recordIssues (
        enabledForFailure: true
        tool: esLint()
      )
    }
  }
}

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

exports.handler = async (event) => {
    
    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
      version: '2021-03-25',
      authenticator: new IamAuthenticator({
        apikey: process.env.API_KEY,
      }),
      serviceUrl: process.env.API_URL,
    });
    
    let toAnalyze = event.historial_clinico;
    
    const analyzeParams = {
      'text': toAnalyze,
      'features': {
        'keywords': {
          'sentiment': true,
          'emotion': true,
          'limit': 5
        },
        'entities': {
          'sentiment': true,
          'limit': 5
        }
      }
    };
    
    naturalLanguageUnderstanding.analyze(analyzeParams)
      .then(analysisResults => {
        console.log(JSON.stringify(analysisResults, null, 2));
        return JSON.stringify(analysisResults, null, 2);
      })
      .catch(err => {
        console.log('error:', err);
        return err;
      });
};

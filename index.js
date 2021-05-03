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
        'emotion': true,
        'limit': 5
      }
    }
  };

  let resultNLU = await naturalLanguageUnderstanding.analyze(analyzeParams)
    .then(analysisResults => {
      console.log(JSON.stringify(analysisResults, null, 2));
      return analysisResults;
    })
    .catch(err => {
      console.log('error:', err);
      return err;
    });

  function pushElementsInArray(arg) {
    let array = [];
    arg.forEach(element => {
      array.push(element['text']);
    });
    return array;
  }

  function palabrasClaveDesc(arg) {
    let keys = [];
    let keyswordDescription = {};
    arg.forEach(element => {
      keys.push(element['text'])

      let emotionValue = 0;
      let emotionKey;

      for (const key in element['emotion']) {
        if (element['emotion'][key] > emotionValue) { 
          emotionKey = key; 
          emotionValue = element['emotion'][key];
        }
      }

      keyswordDescription[element['text']] = {
        "sentimiento": element['sentiment']['label'],
        "relevancia": element['relevance'],
        "repeticiones": element['count'],
        "emocion": emotionKey
      }

    });
    return keyswordDescription;
  }

  function entidadesDesc(arg) {
    let keys = [];
    let keyswordDescription = {};
    arg.forEach(element => {
      keys.push(element['text'])

      let emotionValue = 0;
      let emotionKey;

      for (const key in element['emotion']) {
        if (element['emotion'][key] > emotionValue) { 
          emotionKey = key; 
          emotionValue = element['emotion'][key];
        }
      }

      keyswordDescription[element['text']] = {
        "tipo": element['type'],
        "sentimiento": element['sentiment']['label'],
        "relevancia": element['relevance'],
        "emocion": emotionKey,
        "repeticiones": element['count'],
        "porcentaje_confianza": element['confidence']
      }

    });
    return keyswordDescription;
  }

  return {
    "lenguaje_texto": resultNLU['result']['language'],
    "palabras_clave": pushElementsInArray(resultNLU['result']['keywords']),
    "entidades": pushElementsInArray(resultNLU['result']['entities']),
    "palabras_clave_desc": palabrasClaveDesc(resultNLU['result']['keywords']),
    "entidades_desc": entidadesDesc(resultNLU['result']['entities'])
  };
};

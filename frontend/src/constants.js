const mainColor = '#108ee9';

module.exports = {
  apiPrefix: '/pyapi',
  // apiPrefix: 'http://122.224.116.44:5005',

  jupyterServer: 'http://10.52.14.182:8888/api/contents/',  // kube master node ip
  kubeServer: 'http://10.52.14.182:8888/api/contents/',  // kube master node ip
  // jupyterServer: 'http://10.52.14.182:8888/api/contents/',
  // jupyterServer: 'http://122.224.116.44:9001/api/contents/',

  // server api
  flaskServer: 'http://localhost:5000',
  // flaskServer: 'http://10.52.14.182:5005',
  // flaskServer: 'http://122.224.116.44:5005',

  //jupyter
  kubeBaseUrl: 'http://10.52.14.182:8888',  // kube master node ip
  // baseUrl: 'http://10.52.14.182:8888',
  // baseUrl: 'http://122.224.116.44:9001',

  // assets
  assetsUrl: 'http://122.224.116.44:8008',

  mainColor,

  stepStyle: {
    mainColor,
    beacon: {
      inner: mainColor,
      outer: mainColor,
    },
  },

  statusColor: {
    Running: '#108ee9',
    Completed: '#00a854',
    Terminated: '#f04134',
  },

  privacyChoices: [
    {value: 'all', text: 'Privacy'},
    {value: 'private', text: 'Private'},
    {value: 'public', text: 'Public'}
  ],

  dataCategory: [
    'Business', 'Government', 'Education', 'Environment',
    'Health', 'Housing & Development', 'Public Services',
    'Social', 'Transportation', 'Science', 'Technology'
  ],


  translateDict: {
    'dataAnalysis': 'toolkit',
    'modelling': 'model',
  },

  tempVariable: {
    // nameOrId: '_id',
    nameOrId: 'name',
  },

  statusDict: {
    0: 'ready',
    100: 'running',
    200: 'done',
    300: 'error'
  }

};


export default class MockClient {

  constructor() {
    this.result = {};
  }

  client(method, url) {
    this.result.url = url;
    this.result.method = method;
    const chain = {
      set: headers => {
        this.result.headers = headers;
        return chain;
      },
      query: query => {
        this.result.query = query;
        return chain;
      },
      then: cb => {
        if (url.indexOf('list') > -1) cb([{ id: 'list' }]);
        else if (url.indexOf('read') > -1) cb({ id: 'read' });
        else if (url.indexOf('update') > -1) cb({ id: 'update' });
        else if (url.indexOf('create') > -1) cb({ id: 'create' });
        else if (url.indexOf('del') > -1) cb({ id: 'del' });
        return chain;
      },
      catch: cb => {
        cb({ error: 'foobarbaz' });
        return chain;
      },
    };
    return chain;
  }

}

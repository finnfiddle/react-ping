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
        cb({ response: 'foobarbaz' });
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

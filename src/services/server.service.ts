const serverAddress = process.env.SERVER_ADDRESS
  ? process.env.SERVER_ADDRESS
  : "http://localhost:3000";

export const ServerService = {

  postResource: function (url: string, data: any): Promise<any> {
    var promise = new Promise((resolve, reject) => {
      var headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      let request = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      };

      fetch(serverAddress + url, request)
        .then((response) => {
          return ServerService.handleJsonResponse(response);
        })
        .then((responseJson) => {
          resolve(responseJson);
        })
        .catch((error) => {
          reject(error);
        });
    });

    return promise;
  },

  handleJsonResponse: function (response: any) {
    var promise = new Promise((resolve, reject) => {
      response
        .json()
        .then((responseJson: any) => {
          if (response.ok) {
            resolve(responseJson);
          } else {
            reject(responseJson);
          }
        })
        .catch((error: any) => {
          reject(error);
        });
    });
    return promise;
  }
};

export default ServerService;

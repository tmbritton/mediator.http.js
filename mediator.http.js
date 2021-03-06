var mediator = require('mediator.js');

module.exports = (function(){

  var http = {

    request: new XMLHttpRequest(),
    key: '',

    /**
     * Add event listeners to the XMLHttpRequest object.
     */
    addStatusListeners: function() {
      http.request.addEventListener('progress', function(event) {
        if (event.lengthComputable) {
          mediator.publish(http.key + '-httpUpdate',  Math.round((event.loaded / event.total) * 100));
        }
      });

      http.request.addEventListener('load', function(event){
        http.renderResponse(event);
      });

      http.request.addEventListener('error', function(event){
        mediator.publish(http.key + '-httpError', event);
      });

      http.request.addEventListener('abort', function(event){
        mediator.publish(http.key + '-httpAbort', event);
      });
    },

    /**
     * Turn { key: value } pairs into a foo=bar&turd=var string.
     * @param {object} - key => value pairs
     * @return {string} - serialized object
     */
    serializeKeyValuePairs: function(options_obj) {
      var options_arr = [];
      for (var key in options_obj) {
        if (options_obj.hasOwnProperty(key)) {
          options_arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(options_obj[key]));
        }
      }
      return options_arr.join('&');
    },  

    /**
     * Build and send HTTP request.
     * @param {string} url - url to send request.
     * @param {string} method - HTTP verb; get, put, post, patch, delete
     * @param {object} options - Options supports the following values:
     *   query - {object} - used to construct URI query string.
     *   headers - {object} - used to set HTTP headers.
     *   data - {object} - used for data sent to host.
     *   username - {string} - username for HTTP authentication.
     *   password - {string} - password for HTTP authentication.
     */
    buildRequest: function(url, method, options) {
      var post_data = '';
      if (options && options.query) {
        url += '?' + http.serializeKeyValuePairs(options.query);
      }
      if ((options && options.username) && (options && options.password)) {
        http.request.open(method, url, true, options.username, options.password);
      }
      http.request.open(method, url);
      http.addStatusListeners();
      if (options && options.headers) {
        http.setRequestHeaders(options.headers);
      }
      if (options && options.data) {
        post_data = http.serializeKeyValuePairs(options.data);
      }
      http.request.send(post_data);
    },

    /**
     * Publically exposed method for performing a DELETE request.
     * @param {string} url - url to send request. 
     * @param {object} options - Options supports the following values:
     *   query - {object} - used to construct URI query string.
     *   headers - {object} - used to set HTTP headers.
     *   data - {object} - used for data sent to host.
     *   username - {string} - username for HTTP authentication.
     *   password - {string} - password for HTTP authentication.
     */
    delete: function(url, key, options) {
      http.key = key;
      http.buildRequest(url, 'DELETE', options);
    },

    /**
     * Publically exposed method for performing a GET request.
     * @param {string} url - url to send request. 
     * @param {object} options - Options supports the following values:
     *   query - {object} - used to construct URI query string.
     *   headers - {object} - used to set HTTP headers.
     *   data - {object} - used for data sent to host.
     *   username - {string} - username for HTTP authentication.
     *   password - {string} - password for HTTP authentication.
     */
    get: function(url, key, options) {
      http.key = key;
      http.buildRequest(url, 'GET', options);
    },

    /**
     * Publically exposed method for performing a PATCH request.
     * @param {string} url - url to send request. 
     * @param {object} options - Options supports the following values:
     *   query - {object} - used to construct URI query string.
     *   headers - {object} - used to set HTTP headers.
     *   data - {object} - used for data sent to host.
     *   username - {string} - username for HTTP authentication.
     *   password - {string} - password for HTTP authentication.
     */
    patch: function(url, key, options) {
      http.key = key;
      http.buildRequest(url, 'PATCH', options);
    },

    /**
     * Publically exposed method for performing a POST request.
     * @param {string} url - url to send request. 
     * @param {object} options - Options supports the following values:
     *   query - {object} - used to construct URI query string.
     *   headers - {object} - used to set HTTP headers.
     *   data - {object} - used for data sent to host.
     *   username - {string} - username for HTTP authentication.
     *   password - {string} - password for HTTP authentication.
     */
    post: function(url, key, options) {
      http.key = key;
      http.buildRequest(url, 'POST', options);
    },

    /**
     * Publically exposed method for performing a PUT request.
     * @param {string} url - url to send request. 
     * @param {object} options - Options supports the following values:
     *   query - {object} - used to construct URI query string.
     *   headers - {object} - used to set HTTP headers.
     *   data - {object} - used for data sent to host.
     *   username - {string} - username for HTTP authentication.
     *   password - {string} - password for HTTP authentication.
     */
    put: function(url, key, options) {
      http.key = key;
      http.buildRequest(url, 'PUT', options);
    },

    /**
     * Build and publish response object for a successful response.
     * @param {object} event - https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent
     */
    renderResponse: function(event) {
      var response = {
        statusText: event.target.statusText,
        status: event.target.status,
        xhr: event.target
      };
      if (JSON.parse(event.target.response)) {
        response.data = JSON.parse(event.target.response);
      }
      mediator.publish(http.key + '-httpSuccess', response);
    },

    /**
     * Set request headers from key => value pairs.
     * @param {object} - headers in pairs
     */
    setRequestHeaders: function(headers) {
      for (var header in headers) {
        if (headers.hasOwnProperty(header)) {
          http.request.setRequestHeader(header, headers[header]);
        }
      } 
    }
  };

  return {
    get: http.get,
    post: http.post,
    put: http.put,
    patch: http.patch,
    delete: http.delete
  };
})();
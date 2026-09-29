// CloudFront Function (runtime cloudfront-js-2.0), viewer-request event.
//
// A private S3 origin behind Origin Access Control only applies the default
// root object to `/`. The static export uses trailing-slash directories
// (`/experience/`, `/work/tokenpak/`), so this function:
//   1. issues the permanent redirects from deploy/redirects.json,
//   2. adds the trailing slash to extension-less paths (`/about` -> `/about/`),
//   3. rewrites directory requests to their `index.html` object.
//
// Keep REDIRECTS in sync with deploy/redirects.json (npm run check:security
// enforces parity). Deployment steps: docs/DEPLOYMENT.md.

var REDIRECTS = {
  '/experience/gen-x/': '/experience/1990/',
  '/experience/xennial/': '/experience/2000/',
  '/experience/millennial/': '/experience/2010/',
  '/experience/gen-z/': '/experience/2020/',
  '/experience/gen-alpha/': '/experience/2030/',
  '/experience/gen-beta/': '/experience/2040/',
  '/portfolio/': '/about/',
  '/legacy/': '/experience/',
  '/legacy/experience/': '/experience/',
  '/legacy/experience/gen-x/': '/experience/1990/',
  '/legacy/experience/xennial/': '/experience/2000/',
  '/legacy/experience/millennial/': '/experience/2010/',
  '/legacy/experience/gen-z/': '/experience/2020/',
  '/legacy/experience/gen-alpha/': '/experience/2030/',
  '/legacy/experience/gen-beta/': '/experience/2040/',
  '/legacy/experience/2030/': '/experience/2030/',
  '/legacy/experience/2040/': '/experience/2040/',
  '/legacy/about/': '/about/',
  '/legacy/portfolio/': '/about/',
  '/legacy/resume/': '/resume/',
  '/legacy/contact/': '/contact/',
  '/legacy/work/': '/work/',
  '/legacy/work/agentic-work-fleet/': '/work/agentic-work-fleet/',
  '/legacy/work/kevin-online/': '/work/kevin-online/',
  '/legacy/work/kevinception/': '/work/kevinception/',
  '/legacy/work/mcp-knowledge-logistics/': '/work/mcp-knowledge-logistics/',
  '/legacy/work/tokenpak/': '/work/tokenpak/'
};

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: location }, 'cache-control': { value: 'public, max-age=3600' } }
  };
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  var directory = uri.replace(/index\.html$/, '');
  var key = directory.slice(-1) === '/' ? directory : directory + '/';
  if (REDIRECTS[key]) return redirect(REDIRECTS[key]);

  if (uri.slice(-1) === '/') {
    request.uri = uri + 'index.html';
    return request;
  }

  var lastSegment = uri.split('/').pop();
  if (lastSegment.indexOf('.') === -1) {
    var query = request.querystring && Object.keys(request.querystring).length
      ? '?' + Object.keys(request.querystring).map(function (name) {
          var value = request.querystring[name];
          return value.multiValue
            ? value.multiValue.map(function (item) { return name + '=' + item.value; }).join('&')
            : name + '=' + value.value;
        }).join('&')
      : '';
    return redirect(uri + '/' + query);
  }

  return request;
}

self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/incidents": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/incidents.js"
    ],
    "/incidents/[slug]": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/incidents/[slug].js"
    ],
    "/organizations": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/organizations.js"
    ],
    "/persons": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/persons.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];
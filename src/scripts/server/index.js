/* global __DEV__ */
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import getConfig from '../../../tools/webpack-client.config.js'
import pug from 'pug'
import path from 'path'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import routes from '../shared/router/routes'
import DocumentMeta from 'react-document-meta'

import { Provider } from 'mobx-react'
import * as stores from '../shared/store'

const viewPath = path.join(process.cwd(), 'src', 'scripts', 'views', 'index.pug')
const compiledFn = pug.compileFile(viewPath, {})

const app = express()

function getComponentActions(component = {}) {
  return component.WrappedComponent ?
    getComponentActions(component.WrappedComponent) :
    component.willRender
}

const fetchData = (renderProps, store) => {
  return renderProps.routes
    .map((route) => {
      return getComponentActions(route.component)
    })
    .filter(Boolean)
    .map(willRender => {
      return willRender(store, renderProps)
    });
}

if (__DEV__) {
  const config = getConfig({ dev: true })
  const compiler = webpack(config)

  app.use(webpackDevMiddleware(compiler, {
    // publicPath: config.output.publicPath,
    stats: {colors: true}
  }))

  app.use(webpackHotMiddleware(compiler, {
    log: console.log
  }))
}

if (__DEV__) {
  app.use(express.static(process.cwd() + '/build'))
} else {
  app.use(express.static(path.join(__dirname, '..', '..', '..', 'build', 'public')))
}

app.use((req, res, next) => {
  match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
    if (error) {
      res.status(500).send(error.message)
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      Promise
        .all(fetchData(renderProps, stores))
        .then(() => {
          // You can also check renderProps.components or renderProps.routes for
          // your "not found" component or route respectively, and send a 404 as
          // below, if you're using a catch-all route.
          const data = renderToString(
            <Provider {...stores}>
              <RouterContext {...renderProps} />
            </Provider>
          )
          const meta = DocumentMeta.renderAsHTML()
          res.send(compiledFn({
            title: 'Hey',
            message: 'Hello there!',
            meta,
            data,
            dev: __DEV__
          }))
        })
    } else {
      res.status(404).send('Not found')
    }
  })
})

// app.get('/', (req, res) => {
//   res.send('Hello world!')
// })

app.listen(9090, () => {
  console.log('app listening on 9090!')
})
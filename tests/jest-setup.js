// Jest setup for Vue component tests

// Make Vue available globally for @vue/test-utils
const { createApp } = require('vue')
global.Vue = require('vue')

// Mock additional Vue dependencies if needed
global.VueCompilerDOM = require('@vue/compiler-dom')
global.VueServerRenderer = require('@vue/server-renderer')

// Make @vue/test-utils available
const testUtils = require('@vue/test-utils')
console.log('Test utils available:', Object.keys(testUtils))

// Suppress Vue dev warnings in tests
const app = createApp({})
app.config.warnHandler = () => {}

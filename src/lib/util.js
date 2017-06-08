import Vue from 'vue'

const Instance = new Vue()

export function isServer () {
  return Instance.$isServer
}

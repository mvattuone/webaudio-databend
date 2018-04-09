<template>
  <el-container class="full">
    <el-aside width="350px" class="sidebar">
      <el-collapse v-model="activeName" accordion class="effects" @change="doChange">
        <draggable
          :options="{
            handle: '.d-handle',
            animation: 50,
            forceFallback: true,
            fallbackClass: 'fallback-class',
            fallbackOnBody: true,
          }"
          :list="selectedEffects">
          <el-collapse-item
            v-for="(effect, index) in selectedEffects"
            :name="`${effect.key}-${effect.id}`"
            :class="effectSelected && effectSelected !== `${effect.key}-${effect.id}` ? animationStep : ''"
            :key="effect.id">

            <template slot="title">
              <span
                class="d-handle"
                v-if="!effectSelected">
                <font-awesome-icon icon="bars"></font-awesome-icon>
              </span>
              <span class="effect-label">{{ effect.label }}</span>
            </template>

            <el-form
              size="medium"
              label-position="top">

              <el-row
                type="flex"
                align="middle"
                justify="space-between">
                <el-form-item label="Enabled">
                  <el-switch
                    v-model="effect.enabled"
                    @change="renderBender()">
                  </el-switch>
                </el-form-item>

                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeEffect(index)"
                  circle></el-button>
              </el-row>

              <el-form-item
                v-for="param in effect.params"
                :key="param.key">

                <label
                  v-if="param.label !== 'Value'"
                  slot="label"
                  class="el-form-item__label">{{ param.label }}</label>

                <el-slider
                  v-if="param.type === 'slider'"
                  :min="param.range[0]"
                  :max="param.range[1]"
                  :step="param.step"
                  v-model="param.value"
                  @change="renderBender()">
                </el-slider>

                <el-switch
                  v-if="param.type === 'switch'"
                  v-model="param.value"
                  @change="renderBender()">
                </el-switch>

                <el-select
                  v-if="param.type === 'select'"
                  v-model="param.value"
                  placeholder="Select one"
                  @change="renderBender()">
                  <el-option
                    v-for="item in param.values"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>

          </el-collapse-item>
        </draggable>
      </el-collapse>

      <el-collapse v-model="activeName" accordion class="effects-list" @change="doChange">
        <el-collapse-item
          title="Add Effects"
          name="effects"
          :class="effectSelected ? animationStep : ''">
          <div
            v-for="effect in effectKeys"
            @click="addEffect(effect.key)"
            :key="effect.key"
            >
            <div class="effects-list-item">
              <div class="label">{{ effect.label }}</div>
              <div class="adder"><i class="el-icon-plus"></i></div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div>
          Databender
        </div>
        <el-button
          @click="renderBender()"
          type="primary">Render</el-button>
      </el-header>

      <el-main class="main">
        <input type="file" id="file">

        <div class="canvas">
          <canvas id="canvas"></canvas>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mergeMap'

import * as draggable from 'vuedraggable'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'

import { loadImage, bender, render, config, Effect } from './lib'

export default {
  name: 'app',
  components: {
    draggable,
    FontAwesomeIcon,
  },
  data() {
    const effectKeys = Object.keys(config)
      .sort()
      .map(key => {
        const { label } = config[key]
        return { key, label }
      })

    const selectedEffects: Effect[] = []

    return {
      activeName: 'effects',
      config,
      effectKeys,
      selectedEffects,
      effectSelected: '',
      animationStep: '',
      fileInput: null,
      canvas: null,
    }
  },
  methods: {
    addEffect(key) {
      const id = Math.floor(Math.random() * 90000 + 10000)
      const { label, params } = config[key]
      const effect = {
        key,
        id,
        label,
        enabled: false,
        params: JSON.parse(JSON.stringify(params)),
      }
      this.selectedEffects.push(effect)
    },
    removeEffect(index) {
      this.selectedEffects.splice(index, 1)
      this.closeEffect()
      this.renderBender()
    },
    doChange(val) {
      !val || val === 'effects' ? this.closeEffect() : this.openEffect(val)
    },
    openEffect(val) {
      this.effectSelected = val
      this.animationStep = 'animationStep-0'
      setTimeout(() => {
        this.animationStep = 'animationStep-1'
      }, 500)
      setTimeout(() => {
        this.animationStep = 'animationStep-2'
      }, 800)
    },
    closeEffect() {
      this.animationStep = 'animationStep-2'
      setTimeout(() => {
        this.animationStep = 'animationStep-1'
      }, 500)
      setTimeout(() => {
        this.effectSelected = ''
        this.animationStep = 'animationStep-0'
      }, 800)
    },
    mapEffects() {
      return this.selectedEffects
        .filter(selectedEffect => selectedEffect.enabled)
        .map(selectedEffect => ({
          fn: config[selectedEffect.key].effect,
          config: this.reduceParams(selectedEffect.params),
        }))
    },
    reduceParams(params) {
      return params.reduce(
        (obj, param) => ({
          ...obj,
          [param.key]: param.value,
        }),
        {}
      )
    },
    renderBender() {
      Observable.of(1)
        .filter(() => Boolean(this.fileInput.files.length))
        .map(() => this.fileInput.files[0])
        .mergeMap(file => loadImage(file))
        .map(image => ({ image, userEffects: this.mapEffects() }))
        .mergeMap(({ image, userEffects }) => bender(image, this.canvas, userEffects))
        .subscribe(bent => {
          render(bent.canvas, bent.imageBuffer, bent.audioBuffer)
        })
    },
  },
  mounted() {
    this.fileInput = document.querySelector('#file')
    this.canvas = document.querySelector('#canvas')

    const obs = Observable.fromEvent(this.fileInput, 'change').subscribe(() => {
      this.renderBender()
    })
  },
}
</script>

<style lang="scss">
@import './scss/vars';

.full {
  height: 100vh;
  overflow: hidden;

  .sidebar {
    color: $--color-3;
    background-color: $--color-5;
    background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23AE7F37' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .effects {
      border-top: 0;
      overflow-y: auto;

      .el-collapse-item {
        transition: all 0.3s;
        opacity: 1;
        transform-origin: top;
        position: relative;

        &:not(.is-active) {
          &.animationStep-0,
          &.animationStep-1,
          &.animationStep-2 {
            height: 48px;
          }

          &.animationStep-1,
          &.animationStep-2 {
            opacity: 0;
            transform: scaleY(0);

            .el-collapse-item__arrow {
              display: none;
            }
          }

          &.animationStep-2 {
            height: 0;
          }
        }

        .effect-label {
          position: absolute;
          left: 60px;
          top: 0px;
        }

        .d-handle {
          margin-right: 15px;
          cursor: move;
        }
      }
    }

    .effects-list {
      border-bottom: 0;
    }

    .effects-list-item {
      cursor: pointer;
      display: flex;
      justify-content: space-between;

      .label,
      .adder {
        transition: all linear 0.15s;
      }

      .label {
        will-change: opacity;
        transform: skew(5deg);
        transform-origin: left;
      }

      .adder {
        opacity: 0.4;
      }

      &:hover {
        .label {
          transform: scale(1.1) skew(0deg);
        }

        .adder {
          opacity: 1;
        }
      }

      &:active {
        opacity: 0.8;
      }
    }
  }

  .header {
    color: $--color-5;
    background-color: $--color-1;
    padding: 10px 20px;
    font-size: 30px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: space-between;
  }

  .main {
    padding: 20px;
    color: $--color-1;
    background-color: $--color-5;
    height: 100%;

    .canvas {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 100%;
    }
  }
}
</style>

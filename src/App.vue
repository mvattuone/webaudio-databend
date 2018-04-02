<template>
  <el-container class="full">
    <el-aside width="350px" class="sidebar">
      <el-collapse v-model="activeName" accordion class="effects" @change="doChange">
        <draggable
          :options="{ handle: '.d-handle' }"
          :list="selectedEffects">
          <el-collapse-item
            v-for="effect in selectedEffects"
            :name="`${effect.key}-${effect.id}`"
            :class="effectSelected && effectSelected !== `${effect.key}-${effect.id}` ? animationStep : ''"
            :key="effect.id">

            <template slot="title">
              <span
                class="d-handle"
                v-if="!effectSelected">
                <font-awesome-icon icon="bars"></font-awesome-icon>
              </span>
              <span>{{ effect.label }}</span>
            </template>

            <el-form
              size="medium"
              label-position="top">
              <el-form-item label="Enabled">
                <el-switch v-model="effect.enabled">
                </el-switch>
              </el-form-item>

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
                  :show-stops="param.step > 10"
                  v-model="param.value"></el-slider>

                <el-switch
                  v-if="param.type === 'switch'"
                  v-model="param.value">
                </el-switch>

                <el-select
                  v-if="param.type === 'select'"
                  v-model="param.value"
                  placeholder="Select one">
                  <el-option
                    v-for="item in param.values"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-row
                type="flex"
                justify="end">
                <el-button
                  type="info"
                  icon="el-icon-delete"
                  circle></el-button>
              </el-row>
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
        Databender
      </el-header>

      <el-main class="main">

      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import * as draggable from 'vuedraggable'
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'

import { effects, Effect } from './config'

export default {
  name: 'app',
  components: {
    draggable,
    FontAwesomeIcon,
  },
  data() {
    const effectKeys = Object.keys(effects)
      .sort()
      .map(key => {
        const { label } = effects[key]
        return { key, label }
      })

    const selectedEffects: (Effect)[] = []

    return {
      activeName: 'effects',
      effects,
      effectKeys,
      selectedEffects,
      effectSelected: '',
      animationStep: '',
    }
  },
  methods: {
    addEffect(key) {
      const id = Math.floor(Math.random() * 90000 + 10000)
      const effectClone = JSON.parse(JSON.stringify(effects[key]))
      const effect = Object.assign({}, effectClone, { id, key })
      this.selectedEffects.push(effect)
    },
    doChange(val) {
      if (!val || val === 'effects') {
        this.animationStep = 'animationStep-2'
        setTimeout(() => {
          this.animationStep = 'animationStep-1'
        }, 500)
        setTimeout(() => {
          this.effectSelected = ''
        }, 800)
      } else {
        this.effectSelected = val
        this.animationStep = 'animationStep-1'
        setTimeout(() => {
          this.animationStep = 'animationStep-2'
        }, 500)
        // setTimeout(() => {
        //   this.effectSelected = ''
        // }, 1500)
      }
    },
  },
}
</script>

<style lang="scss">
@import './scss/vars';

.full {
  height: 100vh;
  overflow: hidden;
}
.sidebar {
  color: $--color-1;
  background-color: $--color-2;
  background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23AE7F37' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.el-collapse-item {
  transition: all 0.3s;
  opacity: 1;
  transform-origin: top;

  &:not(.is-active) {
    height: 48px;

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
}

.d-handle {
  margin-right: 15px;
  cursor: move;
}

.header {
  color: $--color-5;
  background-color: $--color-1;
  padding: 10px 20px;
  font-size: 30px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.main {
  padding: 20px;
  color: $--color-1;
  background-color: $--color-5;
}

.effects {
  border-top: 0;
  overflow-y: auto;
}

.effects,
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
</style>

<template>
  <div class="af-address" :style="{overflow: visible ? '' : 'hidden'}">
    <input class="af-input-control" type="text"
            :class="{'af-focus': visible, 'af-disabled': disabled}"
            readonly
            :placeholder="placeholder" 
            :value="valueStr" 
            @click.stop="toggle">
    <i v-if="!removable" @click.stop="toggle" class="_af_address_caret icon-arrow-down"></i>
    <i v-else class="af-cursor _af_address_caret icon-close" @click.stop="remove"></i>
    <af-dropdown :visible="visible" @hide="toggle">
      <dl class="_af_address_detail">
        <dt class="_af_address_division clearfix">
          <span :class="{_af_address_focus: division === HOT}" 
                @click.stop="changeTo(HOT)" v-if="hasHot">热门城市</span>
          <span :class="{_af_address_focus: division === PROVINCE, _af_address_unset: !current.province}" 
                @click.stop="changeTo(PROVINCE)">省份</span>
          <span :class="{_af_address_focus: division === CITY, _af_address_unset: !current.city}" 
                @click.stop="changeTo(CITY)">城市</span>
          <span :class="{_af_address_focus: division === AREA, _af_address_unset: !current.area}" 
                @click.stop="changeTo(AREA)" v-if="hasArea">区县</span>
        </dt>
        <dd v-show="division == HOT">
          <ul class="_af_address_list">
            <li class="_af_address_list_item" v-for="hot in hots" 
                :class="{_af_address_focus: hot === current.city && current.province === hotProvince}"
                @click.stop="selectHot(hot)" v-text="hot"></li>
          </ul>
        </dd>
        <dd v-show="division === PROVINCE">
          <div class="_af_address_capital clearfix" v-for="part in provinces">
            <span class="_af_address_title pull-left" v-text="part.group"></span>
            <ul class="_af_address_list">
              <li class="_af_address_list_item" v-for="province in part.provinces" 
                  :class="{_af_address_focus: province === current.province}"
                  @click.stop="selectProvince(province)" v-text="province"></li>
            </ul>
          </div>
        </dd>
        <dd v-show="division == CITY">
          <ul class="_af_address_list">
            <li class="_af_address_list_item" v-for="city in citys" 
                :class="{_af_address_focus: city === current.city}"
                @click.stop="selectCity(city)" v-text="city"></li>
          </ul>
        </dd>
        <dd v-show="division == AREA">
          <ul class="_af_address_list">
            <li class="_af_address_list_item" v-for="area in areas" 
                :class="{_af_address_focus: area == current.area}"
                @click.stop="selectArea(area, true)" v-text="area"></li>
          </ul>
        </dd>
      </dl>
    </af-dropdown>
  </div>
</template>

<script>
  import afDropdown from './dropdown.vue'
  import Bus from './bus'
  import {hasVnodeListener, isUndefined} from './util'

  const CACHE = {
    hotProvince: null,
    province: null,
    provinceList: null,
    city: {
      max: 5,
      sequence: []
    },
    area: {
      max: 10,
      sequence: []
    }
  }

  const NONE = 'none'
  const HOT = 'hot'
  const PROVINCE = 'province'
  const CITY = 'city'
  const AREA = 'area'

  export default {
    name: 'form-address',
    components: {
      afDropdown
    },
    props: {
      value: null,
      city: {
        type: String,
        validator (val) {
          return isUndefined(val) || !val
        }
      },
      disabled: {
        type: Boolean,
        default: false
      },
      clear: {
        type: String,
        validator (val) {
          return isUndefined(val) || !val
        }
      },
      placeholder: String,
      __afControlBus: Bus,
      detail: Object
    },
    data () {
      return {
        HOT,
        PROVINCE,
        CITY,
        AREA,

        visible: false,
        loading: false,

        division: NONE,

        hots: null,
        provinces: null,
        citys: null,
        areas: null,

        hotProvince: null,
        current: {
          province: '',
          city: '',
          area: ''
        }
      }
    },
    mounted () {
      this.__afShowHandler = hasVnodeListener(this.$vnode, 'show')
      this.__afHideHandler = hasVnodeListener(this.$vnode, 'hide')
      this.__afChangeHandler = hasVnodeListener(this.$vnode, 'change')

      if (this.__afControlBus) {
        this.__af_getValueId = this.__afControlBus.$on('__afGetValue', cb => {
          return cb(this.value)
        })
        this.__afControlBus.$emit('__afCheck', this.value)
      }
    },
    destroyed () {
      if (this.__afControlBus) {
        this.__afControlBus.$off('__afGetValue', this.__af_getValueId)
      }
    },
    computed: {
      hasArea () {
        return isUndefined(this.city)
      },
      hasHot () {
        return !isUndefined(this.city)
      },
      valueObj () {
        var segs = this.value && this.value.split('/') || []
        var res = {}
        switch (segs.length) {
          case 1:
            if (this.hasHot) {
              res.city = segs[0]
            } else {
              res.province = segs[0]
            }
            break
          case 2:
            res.province = segs[0]
            res.city = segs[1]
            break
          case 3:
            res.province = segs[0]
            res.city = segs[1]
            res.area = segs[2]
            break
          default:
            break
        }
        return res
      },
      valueStr () {
        return this.value && (this.hasHot && this.valueObj.city || this.value)
      },
      removable () {
        return !this.disabled && !isUndefined(this.clear) && this.value !== null
      }
    },
    watch: {
      value (val) {
        if (val) {
          this.setAddress(this.valueObj)
        }
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', val)
        }
      }
    },
    methods: {
      toggle () {
        if (this.disabled) {
          return
        }
        var event = this.visible ? 'hide' : 'show'
        var emit = this.visible ? this.__afHideHandler : this.__afShowHandler

        if (emit) {
          this.$emit(event)
        }
        if (!this.visible) {
          if (this.division === NONE) {
            this.setAddress(this.valueObj)
          } else {
            this.division = this.hasHot && HOT || PROVINCE
          }
        }

        this.visible = !this.visible
        if (!this.visible && this.__afControlBus) {
          this.__afControlBus.$emit('__afShowError')
        }
      },
      remove () {
        if (!this.removable) {
          return
        }

        if (!this.value) {
          return
        }
        this.$emit('input', null)
        if (this.__afChangeHandler) {
          this.$emit('change', null)
        }
      },
      changeTo (division) {
        if (this.loading) {
          return
        }

        if (division === AREA && (!this.current.city || !this.current.province)) {
          return
        }
        if (division === CITY && (!this.current.province || (this.hotProvince && this.current.province === this.hotProvince))) {
          return
        }

        this.division = division
      },
      setAddress ({province, city, area}) {
        new Promise(resolve => {
          if (this.division === NONE) {
            // 获取省份列表
            this.init(ok => {
              resolve(ok)
            })
          } else {
            resolve(true)
          }
        }).then(ok => {
          if (!ok) {
            return
          }
          if (this.hotProvince && CACHE.province[this.hotProvince]) {
            // 获取热门城市列表
            this.initProvince(this.hotProvince, ok => {
              if (ok) {
                this.hots = CACHE.city[this.hotProvince].list
                if (!province) {
                  this.current.province = this.hotProvince
                  this.current.city = city
                  this.division = HOT
                } else {
                  this.division = PROVINCE
                }
              }
            })
          } else {
            this.division = PROVINCE
          }

          if (!province || !CACHE.province[province]) {
            return
          }
          this.current.province = province
          // 获取指定省份的城市列表
          this.initProvince(province, ok => {
            if (!ok || !city || !CACHE.city[province].data[city]) {
              return
            }

            this.current.city = city
            // 获取指定城市的区县列表
            this.initCity(province, city, ok => {
              if (!this.hasArea || !ok || !area || !CACHE.area[`${province}-${city}`].data[area]) {
                return
              }
              this.current.area = area
              this.initArea(province, city, area)
            })
          })
        })
      },
      init (cb) {
        if (!CACHE.province) {
          this.loading = true
          this.$emit('fetch', [groups => {
            this.loading = false
            if (!groups) {
              this.provinces = []
              cb && cb()
            } else {
              let groupKeys = Object.keys(groups).sort()
              let hotKey = groupKeys.find(k => k.toLowerCase() === 'hotcity')
              this.provinces = groupKeys.filter(k => k !== hotKey).map(k => {
                return { group: k, provinces: groups[k].map(p => p.name) }
              })
              CACHE.province = groupKeys.reduce((res, key) => {
                return groups[key].reduce((r, p) => {
                  r[p.name] = p
                  return r
                }, res)
              }, {})
              CACHE.provinceList = this.provinces

              if (this.hasHot) {
                CACHE.hotProvince = groups[hotKey][0].name
                this.hotProvince = CACHE.hotProvince
              }
              cb && cb(true)
            }
          }])
        } else {
          this.provinces = CACHE.provinceList
          if (this.hasHot) {
            this.hotProvince = CACHE.hotProvince
          }
          cb && cb(true)
        }
      },
      initProvince (province, cb) {
        var cache = CACHE.city
        var key = province
        if (!cache[key]) {
          this.loading = true
          this.$emit('fetch', [citys => {
            this.loading = false
            if (!citys || !citys.length) {
              this.citys = []
              cb && cb()
            } else {
              if (!this.hotProvince || province !== this.hotProvince) {
                this.citys = citys.map(c => c.name)
              }
              updateCache(cache, key, citys)
              cb && cb(true)
            }
          }, CACHE.province[province]])
        } else {
          this.citys = cache[key].list
          cb && cb(true)
        }
      },
      selectProvince (province) {
        this.initProvince(province, ok => {
          if (ok) {
            this.division = CITY
            this.current.province = province
          }
        })
      },
      initCity (province, city, cb) {
        if (this.detail && !this.hasArea) {
          this.detail.province = CACHE.province[province]
          this.detail.city = CACHE.city[province].data[city]
        }

        if (!this.hasArea) {
          cb && cb(true)
          return
        }

        var cache = CACHE.area
        var key = `${province}-${city}`
        if (!cache[key]) {
          this.loading = true
          this.$emit('fetch', [areas => {
            this.loading = false
            if (!areas || !areas.length) {
              this.areas = []
              cb && cb()
            } else {
              this.areas = areas.map(a => a.name)
              updateCache(cache, key, areas)
              cb && cb(areas)
            }
          }, CACHE.province[province], CACHE.city[province].data[city]])
        } else {
          this.areas = cache[key].list
          cb && cb(true)
        }
      },
      selectHot (city) {
        this.current.province = this.hotProvince
        this.selectCity(city)
      },
      selectCity (city) {
        var province = this.current.province
        this.initCity(province, city, ok => {
          if (ok) {
            this.current.city = city
            if (this.hasArea) {
              this.division = AREA
            } else {
              this.toggle()

              if (city === this.value) {
                return
              }
              this.$emit('input', city)
              if (this.__afChangeHandler) {
                this.$emit('change', city)
              }
            }
          }
        })
      },
      initArea (province, city, area) {
        if (this.detail) {
          this.detail.province = CACHE.province[province]
          this.detail.city = CACHE.city[province].data[city]
          this.detail.area = CACHE.area[`${province}-${city}`].data[area]
        }
      },
      selectArea (area) {
        this.toggle()
        this.initArea(this.current.province, this.current.city, area)
        this.current.area = area

        var nval = ['province', 'city', 'area'].map(key => this.current[key]).join('/')
        if (this.value === nval) {
          return
        }

        this.$emit('input', nval)
        if (this.__afChangeHandler) {
          this.$emit('change', nval)
        }
      }
    }
  }

  function updateCache (cache, key, value) {
    if (cache.sequence.length > cache.max) {
      // 删掉最久的缓存数据
      delete cache[cache.sequence[0]]
      cache.sequence.shift()
    }
    cache[key] = { list: [], data: {} }
    value.forEach(v => {
      cache[key].list.push(v.name)
      cache[key].data[v.name] = v
    })
    cache.sequence.push(key)
  }
</script>

<style lang="less">
  @import (reference) "../style/variable.less";

  .af-address {
    display: inline-block;
    position: relative;
    width: 100%;
    color: @dark;
    font-size: 14px;
    line-height: normal;

    .af-input-control {
      padding-right: 25px;
    }

    ._af_address_caret {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: @light;
      font-size: 12px;
    }


    .af-dropdown {
      width: 436px;
      padding: 0 30px 10px;

    ._af_address_detail {
      position: relative;
    }

    ._af_address_division {
      height: 52px;
      line-height: 52px;
      border-bottom: 1px solid #f3f3f3;

      span {
        float: left;
        width: 33.3%;
        font-size: 16px;
        text-align: center;
        cursor: pointer;

        &._af_address_unset {
          color: @lighter;
        }
        &._af_address_focus {
          color: @primary;
          position: relative;

          &:after {
            content: "";
            width: 100%;
            height: 2px;
            background: @primary;
            position: absolute;
            top: 51px;
            left: 0;
          }
        }
      }
    }

    ._af_address_capital {
      margin-top: 20px;
      overflow: hidden;

      ._af_address_title {
        width: 52px;
        padding-top: 2px;
        font-size: 16px;
        font-weight: 700;
        color: @dark;
        text-align: left;
      }

      ._af_address_list {
        margin-left: 52px;
        margin-top: 0;
      }
    }

    dd {
      margin-left: 0;
    }
    ._af_address_list {
      margin: 0;
      margin-top: 20px;
      padding: 0;
      list-style: none;
      text-align: left;
      font-size: 14px;

      ._af_address_list_item {
        display: inline-block;
        line-height: 26px;
        margin-left: 22px;
        cursor: pointer;
        max-width: 74px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;

        &._af_address_focus {
          color: @primary;
        }
      }
    }
  }
}
</style>
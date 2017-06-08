<template>
  <div class="demo">
    <af-address :disabled="true" clear city v-model="address.value"
                :detail="address.detail" @fetch="fetch(...$event)"></af-address>

    <af-datepicker clear clock v-model="datepicker.value"></af-datepicker>
    <af-monthpicker clear v-model="monthpicker.value"></af-monthpicker>
    <af-select clear v-model="select.value">
      <af-option label="LABLE1" :value="1"></af-option>
      <af-option label="LABLE2" :value="2"></af-option>
    </af-select>
    <af-mselect v-model="mselect.value" placeholder="多选下拉框" clear>
      <af-optgroup label="组一">
        <af-option value="a" label="label1"></af-option>
        <af-option value="b" label="label2"></af-option>
      </af-optgroup>
      <af-optgroup label="组二">
        <af-option value="c" label="label3"></af-option>
        <af-option value="d" label="label4"></af-option>
      </af-optgroup>
    </af-mselect>
    <af-textlist v-model="textlist.value"></af-textlist>
    <af-position v-model="position.value" @fetch="fetchPosition(...$event)" @change="onPositionType" @leaf="onPosition"></af-position>
    <span>{{position.value}}</span>
    <af-input v-model="position.name"></af-input>
    <af-scroll bar :speed="10" style="max-height: 200px; border: 1px solid #bbb">
      <div>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
        实力可见对方立刻束带结发<br>
      </div>
    </af-scroll>
  </div>
</template>
<script>
  import axios from 'axios'
  export default {
    data () {
      return {
        address: {
          value: '北京',
          detail: {
            province: null,
            city: null,
            area: null
          }
        },
        datepicker: {
          value: '2017-02-03 11:30'
        },
        monthpicker: {
          value: '2017-02'
        },
        select: {
          value: 1
        },
        mselect: {
          value: []
        },
        position: {
          value: null,
          name: null
        },
        textlist: {
          value: ''
        }
      }
    },
    methods: {
      fetch (cb, province, city) {
        var parentId = province && ((city && city.id) || province.id) || ''
        axios.get(`/api/lbsInfos/${parentId}`).then(res => {
          cb(parentId && res.data || res)
        }, err => {
          console.log(err)
          cb()
        })
      },
      fetchPosition (cb, id) {
        axios.get(`/api/position/lables/${id || ''}`).then(res => {
          cb(res.map(el => {
            return {
              id: el.id,
              name: el.name
            }
          }))
        })
      },
      onPositionType (val) {
        console.log(val)
      },
      onPosition (val) {
        this.position.name = val
      }
    }
  }
</script>

<style lang="less">
  .demo {
    margin-bottom: 100px;
    padding-top: 24px;
  }
  .demo .modelValue{
    line-height: 40px;
  }
  .selectbox {
    .af-dropdown {
      .af-scroll {
        height: 200px;
      }
    }
  }
  .af-mselect .af-dropdown .af-scroll .af-optgroup {
    width: 50%;
  }

  .position-item{
    margin: 30px 0;
    position: relative;
  }
  .af-table-first{
    width: 99px;
  }
  .af-textlist .af-textlist-editor {
    min-height: 69px;
    max-height: 320px;
  }
</style>

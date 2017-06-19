<style>
.km-select .km-scroll {
  max-height: 200px;
}
</style>

<template>
  <div id="app">
    <km-form class="km-inline" :bus="person.bus" @submit="onSubmitPersonInfo">
      <km-form-control name="edu">
        <km-select :clearable="true" v-model="person.info.edu" :expandable="true" :multiple="true">
          <km-optgroup>
            <div>自定义组</div>
            <km-option label="Label1" value="Value1"><div>自定义标签</div></km-option>
            <km-option label="Label2" value="Value2"></km-option>
          </km-optgroup>
          <km-optgroup label="组2">
            <km-option label="Label3" value="Value3"></km-option>
            <km-option label="Label4" value="Value4"></km-option>
          </km-optgroup >
          <km-optgroup label="组3">
            <km-option label="Label5" value="Value5"></km-option>
            <km-option label="Label6" value="Value6"></km-option>
          </km-optgroup>
        </km-select>
      </km-form-control>
      <km-form-control name="age" :number="true" @check="onCheckPersonAge">
        <km-input v-model="person.info.age"></km-input>
      </km-form-control>
      <km-form-control name="birthday" @check="onCheckPersonBirthday">
        <km-datepicker :hastime="true" v-model="person.info.birthday"></km-datepicker>
      </km-form-control>
      <km-form-action>
        <button type="submit">提交</button>
      </km-form-action>
    </km-form>

    <km-tip-head tag="button" trigger="hover" :bus="tip.bus" position="bottom" :eid="tip.eid" :edata="tip.edata">TIP</km-tip-head>
    <km-tip-head :bus="tip.bus" position="right" :eid="tip.eid1" :edata="tip.edata">TIP</km-tip-head>
    <km-tip-body :bus="tip.bus">
      <template scope="{eid, edata}">
        <div>{{eid.name}}</div>
        <div>{{edata.name}}</div>
      </template>
    </km-tip-body>

    <km-table :table="table" :rowspan="true">
      <km-tcell head="个人信息">
        <km-tcell head="姓名" body="person.name"></km-tcell>
        <km-tcell head="职业" body="person.job[]"></km-tcell>
      </km-tcell>
      <km-tcell head="年龄" body="person.age" v-if="table.showAge"></km-tcell>
    </km-table>
    <button @click.stop="changeTable">改变表格</button>
  </div>
</template>

<script>
import Vue from 'vue'
import {Bus} from 'komp'

export default {
  data () {
    return {
      person: {
        bus: new Bus(),
        edu: null,
        info: {
          edu: [],
          age: null,
          birthday: null
        }
      },
      tip: {
        bus: new Bus(),
        eid1: {name: 'shimoo'},
        eid: {name: 'SHIMOO'},
        edata: {name: 'SHIKUIJIE'}
      },
      table: {
        showAge: true,
        tbody: [{
          person: {
            name: 'shikuijie',
            age: 32,
            job: ['Web Programmer', 'Data Engineer']
          }
        }, {
          person: {
            name: 'lagou',
            age: 4,
            job: ['Internet Job', 'Freelancer Platform']
          }
        }]
      }
    }
  },
  methods: {
    onChangeSelect (val) {
    },
    onChangeSuggest (val) {
      console.log(val)
    },
    onCheckPersonAge ({value, resolve}) {
      window.setTimeout(() => {
        console.log('check age')
        resolve()
      }, 1000)
    },
    onCheckPersonBirthday ({value, resolve}) {
      window.setTimeout(() => {
        console.log('check birthday')
        resolve()
      }, 500)
    },
    onSubmitPersonInfo (resolve) {
      console.log('start submit person info')
      window.setTimeout(() => {
        console.log('submit person info stop')
        resolve()
      }, 2000)
    },
    changeTable () {
      this.table.showAge = !this.table.showAge
    }
  }
}
</script>

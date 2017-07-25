<style>
</style>

<template>
  <div id="app">
    <km-form class="km-inline" :bus="person.bus" @submit="onSubmitPersonInfo" @invalid="onPersonInvalid">
      <km-form-control style="width:300px" name="edu">
        <km-select :clearable="true" :multiple="false" placeholder="占位字符串" v-model="person.info.edu">
          <km-optgrp :label="grp.label" v-for="grp in person.info.groups" :key="grp.label"> 
            <km-option :label="opt.label" :value="opt.value" v-for="opt in grp.options" :key="opt.label"></km-option>
          </km-optgrp>
        </km-select>
      </km-form-control>
      <km-form-control style="width:200px" name="age" :required="true" :number="true" @check="onCheckPersonAge">
        <km-input v-model="person.info.age"></km-input>
      </km-form-control>
      <km-form-control style="width:200px" name="birthday" @check="onCheckPersonBirthday">
        <km-datepicker :hastime="true" v-model="person.info.birthday"></km-datepicker>
      </km-form-control>
      <km-form-action>
        <button class="km-btn" type="submit">提交</button>
      </km-form-action>
    </km-form>

    <km-tip-anchor tag="button" class="km-btn" :bus="tip.bus" position="bottom" :edata="tip.edata">TIP</km-tip-anchor>
    <km-tip-anchor class="km-btn" :bus="tip.bus" position="right" :edata="tip.edata">TIP</km-tip-anchor>
    <km-tip-ship :bus="tip.bus" @show="onShowTip" style="width: 320px;">
      <template scope="{eid, edata}">
        <div>{{eid.name}}</div>
        <div>{{edata.name}}</div>
      </template>
    </km-tip-ship>

    <km-colfix-table :table="table" fixed="both" class="km-bordered">
      <km-tcell head="姓名" body="person.name"></km-tcell>
      <km-tcell head="联系方式" body="person.contact"></km-tcell>
      <km-tcell head="年龄" body="person.age"></km-tcell>
      <km-tcell head="职业" body="person.job"></km-tcell>
      <km-tcell head="联系方式" body="person.contact"></km-tcell>
      <km-tcell head="年龄" body="person.age"></km-tcell>
      <km-tcell head="职业" body="person.job"></km-tcell>
      <km-tcell head="联系方式" body="person.contact"></km-tcell>
      <km-tcell head="年龄" body="person.age"></km-tcell>
      <km-tcell head="职业" body="person.job"></km-tcell>
    </km-colfix-table>

    <km-modal-anchor :bus="modal.bus" :edata="{name: 'Shimoo'}">弹窗</km-modal-anchor>
    <km-modal-anchor :bus="modal.bus" :edata="{name: 'Shikuijie'}">弹窗2</km-modal-anchor>
    <km-modal-ship :bus="modal.bus" @show="onShowModal">
      <template scope="{edata}">
        <div style="width: 480px; height: 640px">
          <button class="km-btn" @click.stop="modal.bus.$emit('modal.toggle', edata)">{{edata.name}}</button>
        </div>
      </template>
    </km-modal-ship>

    <km-notice :bus="notice.bus"></km-notice>
    <button class="km-btn" @click.stop="notify">通知</button>

    <km-suggest v-model="suggest.value" init-text="sdlkf" @textchange="onWriteSuggest" :multiple="false" :clearable="true">
      <km-option v-for="sugg in suggest.items" :key="sugg.value" :label="sugg.label" :value="sugg.value"></km-option>
    </km-suggest>

    <km-select :cascaded="true">
      <km-optgrp label="group1" value="grpval1">
        <km-option value="value1" label="label1"></km-option>
        <km-option value="value2" label="label2"></km-option>
        <km-option value="value3" label="label3"></km-option>
      </km-optgrp>
    </km-select>
  </div>
</template>

<script>
import Vue from 'vue'
import {Bus} from 'lib'

export default {
  data () {
    return {
      person: {
        bus: new Bus(),
        edu: null,
        info: {
          edu: [],
          age: null,
          birthday: null,
          groups: [{
            label: 'group1',
            options: [{
              label: 'label1',
              value: {name: 'value1'}
            }, {
              label: 'label2',
              value: {name: 'value2'}
            }]
          }, {
            label: 'group2',
            options: [{
              label: 'label3',
              value: {name: 'value3'}
            }, {
              label: 'label4',
              value: {name: 'value4'}
            }]
          }]
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
            job: 'Web Programmer',
            contact: '15641877656'
          }
        }, {
          person: {
            name: 'lagou',
            age: 4,
            job: 'Internet Job',
            contact: 'skj9798@163.com'
          }
        }]
      },
      modal: {
        bus: new Bus()
      },
      notice: {
        bus: new Bus()
      },
      suggest: {
        value: [],
        items: []
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
    onPersonInvalid (errs) {
      console.log(errs)
      alert('表单验证错误，请查看')
    },
    onShowTip ({resolve, eid}) {
      window.setTimeout(() => {
        resolve(eid)
      }, 2000)
    },
    onShowModal ({resolve}) {
      console.log('show modal')
      window.setTimeout(() => {
        resolve(true)
      }, 500)
    },

    notify () {
      var success = Math.floor(Math.random() * 10) % 2
      this.notice.bus.$emit( success ? 'notice.success' : 'notice.fail', success ? '成功了，真厉害' : '失败了，好挫啊')
    },
    onWriteSuggest ({resolve, text}) {
      window.setTimeout(() => {
        this.suggest.items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => {
          var t = text + [1, 2, 3, 4, 5].map(() => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('')
          return {
            label: t,
            value: t
          }
        })
        resolve()
      })
    }
  }
}
</script>

<style lang="less">
.km-select .km-scroll {
  max-height: 200px;
}

.km-table {
  .km-tcell {
    width: 10em;
    padding-left: 1em;
  }

  thead {
    tr {
      height: 60px;
    }
  }
  tbody {
    tr {
      height: 80px;
    }
  }
}

.km-suggest .km-scroll {
  max-height: 224px;
}
</style>

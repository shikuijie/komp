<style>
</style>

<template>
  <div id="app">
    <km-form class="km-inline" :bus="person.bus" @submit="onSubmitPersonInfo" @invalid="onPersonInvalid">
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
      <km-form-control name="age" :required="true" :number="true" @check="onCheckPersonAge">
        <km-input v-model="person.info.age"></km-input>
      </km-form-control>
      <km-form-control name="birthday" @check="onCheckPersonBirthday">
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

    <km-table-scroll :table="table" fixed="both" class="km-bordered">
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
    </km-table-scroll>
    <button @click.stop="changeTable">改变表格</button>

    <km-modal-anchor :bus="modal.bus" :edata="{name: 'Shimoo'}">弹窗</km-modal-anchor>
    <km-modal-anchor :bus="modal.bus" :edata="{name: 'Shikuijie'}">弹窗2</km-modal-anchor>
    <km-modal-ship :bus="modal.bus" @show="onShowModal">
      <template scope="{edata}">
        <div style="width: 480px; height: 640px">
          <button class="km-btn" @click.stop="modal.bus.$emit('modal.toggle', edata)">{{edata.name}}</button>
        </div>
      </template>
    </km-modal-ship>

    <km-flash :bus="flash.bus"></km-flash>
    <button class="km-btn" @click.stop="notify">通知</button>
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
      flash: {
        bus: new Bus()
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
      alert('表单验证错误，请查看')
    },
    changeTable () {
      this.table.showAge = !this.table.showAge
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
      }, 2000)
    },

    notify () {
      var success = Math.floor(Math.random() * 10) % 2
      this.flash.bus.$emit( success ? 'flash.success' : 'flash.fail', success ? '成功了，真厉害' : '失败了，好挫啊')
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
</style>

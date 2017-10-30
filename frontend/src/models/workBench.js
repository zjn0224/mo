import * as dataAnalysisService from '../services/dataAnalysis'
import * as stagingDataService from '../services/stagingData'
import * as modelService from '../services/model'
import { arrayToJson } from '../utils/JsonUtils'
import pathToRegexp from 'path-to-regexp'
import { cloneDeep } from 'lodash'

export default {
  namespace: 'workBench',
  state: {
    //左侧
    isLeftSideBar: true,
    //用户拥有的 section
    sectionsJson: {},
    //现在开启的 section
    activeSectionsId: ['new_launcher ' + 'init'],
    //焦点位置section名称
    focusSectionsId: 'new_launcher ' + 'init',
    //加载状态
    loading: false,

    stagingDataList: [],

    launchItems: [],

    // 渲染launcher页面，能提供toolkit
    algorithms: [],

    // 右侧激活的preview表格

    projectId: null,
    mouseOverField: null,

    // activeKey: ['1']

  },
  reducers: {
    // 改变 left_side_bar
    toggleLeftSideBar(state, action) {
      return {
        ...state,
        isLeftSideBar: !state.isLeftSideBar,
      }
    },

    // 更新sections
    setSections(state, action) {
      return {
        ...state,
        sectionsJson: action.payload.sectionsJson,
      }
    },

    // 添加一个 section
    addNewSection(state, action) {
      return {
        ...state,
        sectionsJson: {
          ...state.sectionsJson,
          [action.payload.section['_id']]: action.payload.section,
        },

      }
    },

    // 添加 active section, 将 focus 移到
    addActiveSection(state, action) {
      return {
        ...state,
        activeSectionsId: state.activeSectionsId.concat(action.sectionId),
        focusSectionsId: action.sectionId,
      }
    },

    // 关闭 active section
    removeActiveSection(state, action) {
      // 将 action.section_name 删掉
      return {
        ...state,
        activeSectionsId: state.activeSectionsId.filter(sectionId => sectionId !== action.sectionId),
      }
    },

    // 替换
    replaceActiveSection(state, action) {
      return {
        ...state,
        activeSectionsId: state.activeSectionsId
          .filter(sectionId => sectionId !== action.payload.oldSectionId).concat(action.payload.newSectionId),
        focusSectionsId: action.payload.newSectionId,
      }
    },

    // 更新 active sections (看是否需要）
    setActiveSections(state, action) {
      return {
        ...state,
        activeSectionsId: action.activeSectionsId,
      }
    },

    // 切换 focus section
    setFocusSection(state, action) {
      return {
        ...state,
        focusSectionsId: action.focusSectionsId,
      }
    },

    // 改变 sections 好像不需要

    // 改变loading
    set_loading(state, action) {
      return {
        ...state,
        loading: action.loading,
      }
    },

    // 更改 stagingDataList
    setStagingDataList(state, action) {
      return {
        ...state,
        stagingDataList: action.stagingDataList,
      }
    },

    // 储存 algorithms
    setAlgorithms(state, action) {
      return {
        ...state,
        algorithms: action.payload.algorithms,
      }
    },

    setProjectId(state, action) {
      return {
        ...state,
        projectId: action.payload.projectId,
      }
    },

    deleteSectionR(state, action) {
      let newsectionsJson = state.sectionsJson
      delete newsectionsJson[action.payload.sectionId]
      return {
        ...state,
        sectionsJson: newsectionsJson,
      }
    },

    // 去除active section
    removeActiveSection(state, action) {
      let targetKey = action.payload.targetKey
      let activeKey = state.focusSectionsId
      let lastIndex
      state.activeSectionsId.forEach((active_sectionId, i) => {
        if (active_sectionId === targetKey) {
          lastIndex = i - 1
          if (lastIndex < 0) {
            lastIndex = 0
          }
        }
      })

      const new_activeSectionsId = state.activeSectionsId.filter(active_sectionId => active_sectionId !== targetKey)
      console.log('lastIndex', lastIndex)
      console.log('new_activeSectionsId', new_activeSectionsId)

      if (lastIndex >= 0 && activeKey === targetKey) {
        activeKey = new_activeSectionsId[lastIndex]
        console.log('activeKey', activeKey)
      }

      return {
        ...state,
        focusSectionsId: activeKey,
        activeSectionsId: new_activeSectionsId,
      }
    },

    //
    updateSteps(state, action) {

    },

    addRemoveField(state, action) {
      const fieldName = action.payload.fieldName
      const section = state.sectionsJson[action.payload.sectionId]
      const values = section.steps[1].args[0].values
      if (!values.includes(fieldName)) {
        values.push(fieldName)
        console.log('push', values)

      } else {
        values.splice(values.indexOf(fieldName), 1)
        console.log('pop', values)

      }
      section.steps[1].args[0].values = values

      console.log('section', section)

      return {
        ...state,
        sectionsJson: {
          ...state.sectionsJson,
          [action.payload.sectionId]: section,

        },
      }
    },

    addMouseOverField(state, action) {
      const { fieldName, sectionId } = action.payload
      return {
        ...state,
        mouseOverField: fieldName,
      }
    },

    removeMouseOverField(state, action) {
      return {
        ...state,
        mouseOverField: null,
      }
    },

    setParameter(state, action) {
      const { sectionId, stepIndex, argIndex, value } = action.payload
      let sectionsJson = state.sectionsJson
      sectionsJson[sectionId].steps[stepIndex].args[argIndex].value = value
      return {
        ...state,
        sectionsJson,
      }
    },

    // setValues(){
    //
    // },

    addValue(state, action) {
      const { sectionId, stepIndex, argIndex, value, valueIndex } = action.payload

      let sectionsJson = state.sectionsJson
      sectionsJson[sectionId].steps[stepIndex].args[argIndex].values.splice(valueIndex, 0, value)
      return {
        ...state,
        sectionsJson,
      }
    },

    setValueOfValues(state, action) {
      const { sectionId, stepIndex, argIndex, value, valueIndex } = action.payload
      let sectionsJson = state.sectionsJson
      sectionsJson[sectionId].steps[stepIndex].args[argIndex].values[valueIndex] = value
      return {
        ...state,
        sectionsJson,
      }
    },

    updateValueOfValues(state, action) {
      const { sectionId, stepIndex, argIndex, value, valueIndex } = action.payload
      let sectionsJson = state.sectionsJson
      // sectionsJson[sectionId].steps[stepIndex].args[argIndex].values[valueIndex] = value;
      for (let key in value) {
        sectionsJson[sectionId].steps[stepIndex].args[argIndex].values[valueIndex][key] = value[key]
      }
      return {
        ...state,
        sectionsJson,
      }
    },

    updateLayerArgs(state, action) {
      const { sectionId, stepIndex, argIndex, value, valueIndex } = action.payload
      let sectionsJson = state.sectionsJson
      // sectionsJson[sectionId].steps[stepIndex].args[argIndex].values[valueIndex] = value;
      for (let key in value) {
        let idx = sectionsJson[sectionId].steps[stepIndex].args[argIndex].values[valueIndex].args.findIndex(e => e.name === key)
        let  v = value[key]
        if(key === 'name') {
          sectionsJson[sectionId].steps[stepIndex].args[argIndex].values[valueIndex].name = v
        } else if(Array.isArray(v)) {
          sectionsJson[sectionId].steps[stepIndex].args[argIndex].values[valueIndex].args[idx].values = v
        } else {
          sectionsJson[sectionId].steps[stepIndex].args[argIndex].values[valueIndex].args[idx].value = v
        }
      }
      return {
        ...state,
        sectionsJson,
      }
    },

    setLayerParameter(state, action) {
      const { sectionId, stepIndex, argIndex, value } = action.payload
      let sectionsJson = state.sectionsJson
      sectionsJson[sectionId].steps[stepIndex].args[argIndex].value = value
      return {
        ...state,
        sectionsJson,
      }
    },

    setActiveKey(state, action) {

      const { sectionId, activeKey } = action.payload

      let sectionsJson = state.sectionsJson
      sectionsJson[sectionId].active_steps = activeKey
      return {
        ...state,
        sectionsJson,
      }
    },

  },
  effects: {
    // 获取用户所有sections
    *fetchSections(action, { call, put }) {
      const { data: { [action.categories]: sections } } = yield call(dataAnalysisService.fetchSections, {
        projectId: action.projectId,
        categories: action.categories,
      })
      // array to json
      const sectionsJson = arrayToJson(sections, '_id')
      yield put({ type: 'setSections', payload: { sectionsJson: sectionsJson } })
    },

    *fetchAlgorithms(action, { call, put }) {
      const requestFunc = {
        toolkit: dataAnalysisService.fetchToolkits,
        model: modelService.fetchModels,
      }
      const { data: algorithms } = yield call(requestFunc[action.categories])
      yield put({ type: 'setAlgorithms', payload: { algorithms: algorithms } })
    },
    // 删除 section

    // 获取stage data set list
    *fetchStagingDatasetList(action, { call, put, select }) {
      const projectId = action.projectId
      const { data: stagingDataList } = yield call(stagingDataService.fetchStagingDatas, projectId)
      yield put({ type: 'setStagingDataList', stagingDataList })

    },

    // 保存section
    *saveSection(action, { call, put, select }) {
      const { namespace, sectionId } = action.payload

      const sectionsJson = yield select(state => state[namespace].sectionsJson)
      const section = sectionsJson[sectionId]

      const { data: result } = yield call(dataAnalysisService.saveSection, { section: section })
      // 没有后续操作了？
    },

    //删除section
    *deleteSection(action, { call, put, select }) {
      //1. 后端删除
      const { data } = yield call(dataAnalysisService.deleteSection, { sectionId: action.payload.sectionId })

      //2. 前端删除
      if (data) {
        console.log('delete ' + action.payload.sectionId)
        yield put({ type: 'removeActiveSection', payload: { targetKey: action.payload.sectionId } })

        yield put({ type: 'deleteSectionR', payload: { sectionId: action.payload.sectionId } })

      }

    },

    // 获取fields
    *getFields(action, { call, put, select }) {
      const { stepIndex, argIndex, namespace } = action.payload

      const sectionsJson = yield select(state => state[namespace].sectionsJson)
      // const section = sectionsJson[action.payload.sectionId];
      const { data } = yield call(stagingDataService.fetchFields, action.payload.stagingDatasetId)
      sectionsJson[action.payload.sectionId].steps[stepIndex + 1].args[argIndex].fields = data
      yield put({ type: 'setSections', payload: { sectionsJson: sectionsJson } })

    },

    // 更新用户 section 为什么没用到
    *updateSection(action, { call, put, select }) {
      // 开始加载
      const sectionId = action.sectionId
      const sectionsJson = yield select(state => state.dataAnalysis.sectionsJson)
      const section = sectionsJson[sectionId]
      const sections = yield call(dataAnalysisService.updateSection, sectionId, section)

      // 停止加载
      // 显示保存成功
      // yield put({type: 'setSections', sections})

    },

    // 添加 section
    *addSection(action, { call, put, select }) {
      const { namespace } = action.payload

      const projectId = yield select(state => state[namespace].projectId)

      //todo 1. 向后台发起请求 获得section 的json 内容
      const { data: { job: newSection } } = yield call(dataAnalysisService.addSection, {
        ...action.payload,
        project_id: projectId,
      })

      // 2. 添加section
      yield put({ type: 'addNewSection', payload: { section: newSection } })

      // 3. 替换原有active section
      yield put({
        type: 'replaceActiveSection',
        payload: {
          // 原先的launcher id
          oldSectionId: action.payload.sectionId,
          newSectionId: newSection._id,
        },
      })
    },

    *runSection(action, { call, put, select }) {
      const { namespace, sectionId } = action.payload
      // 先把 save section 复制过来
      const sectionsJson = yield select(state => state[namespace].sectionsJson)
      const section = sectionsJson[sectionId]
      yield call(dataAnalysisService.saveSection, { section: section })

      const projectId = yield select(state => state[namespace].projectId)

      const { data: { result } } = yield call(dataAnalysisService.runJob, {
        ...action.payload,
        projectId: projectId,
      })

      console.log('result', result)

    },

  },
  subscriptions: {
    // 当进入该页面是 获取用户所有 section
    // setup({ dispatch, history }) {
    //   const pathJson = {
    //     analysis: 'toolkit',
    //     modelling: 'model',
    //   };
    //   return history.listen(({ pathname }) => {
    //     const match = pathToRegexp('/workspace/:projectId/:categories').exec(pathname)
    //     if (match) {
    //       let projectId = match[1];
    //       let path = match[2];
    //       if (path in pathJson) {
    //         const categories = pathJson[path];
    //         dispatch({ type: 'fetchSections', projectId: projectId, categories })
    //         dispatch({ type: 'fetchAlgorithms', categories });
    //         dispatch({ type: 'fetchStagingDatasetList' });
    //       }
    //     }
    //   })
    // },
  },
}

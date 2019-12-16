export const getType = actionCreator => actionCreator().type;

export const createRootReducer = (reducerMap) => {
  const map = reducerMap.reduce((acc, [reducer, ...actions]) => createMap(actions, reducer, acc), {});

  return (state = null, action) => {
    return map.hasOwnProperty(action.type)
      ? map[action.type].reduce((nextState, reducer) => reducer(nextState, action), state)
      : state;
  };
};

const createMap = (actions, reducer, prevMap) => actions.reduce((acc, action) => {
  const type = getType(action);

  if (!acc.hasOwnProperty(type)) {
    acc[type] = [];
  }

  acc[type].push(reducer);

  return acc;
}, prevMap);

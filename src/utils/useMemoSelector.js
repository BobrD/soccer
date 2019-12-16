import {useCallback} from "react";
import {useSelector} from "react-redux";

export const useMemoSelector = (callback, inputs) => {
    const selector = useCallback(callback, inputs);

    return useSelector(selector);
};
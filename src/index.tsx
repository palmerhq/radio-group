import * as React from 'react';

const codes = {
  RETURN: 13,
  SPACE: 32,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
};

export interface RadioGroupCtx<V, Siblings = V[]> {
  value: V;
  otherRadioValues: Siblings;
  setChecked: (value: any) => void;
}

const RadioGroupContext = React.createContext<RadioGroupCtx<any>>({} as any);

export interface RadioProps<V> {
  value: V;
  children: any;
  onFocus?: (e: React.FocusEvent<any>) => void;
  onBlur?: (e: any) => void;
}

export interface RadioGroupProps<V> {
  labelledBy: string;
  children: React.ComponentType<RadioProps<V>>[];
  value: V;
  onChange: (value: V) => void;
}

export function RadioGroup<V>({
  labelledBy,
  children,
  value,
  ...props
}: RadioGroupProps<V>) {
  const setChecked = React.useCallback(v => {
    if (props.onChange) {
      props.onChange(v);
    }
  }, []);

  const otherRadioValues = React.Children.map<any, any>(
    children,
    child => child.props.value
  );
  const ctx = React.useMemo(
    () => ({
      value,
      otherRadioValues,
      setChecked,
    }),
    [otherRadioValues, value]
  );
  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        data-palmerhq-radio-group
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export const Radio = React.forwardRef<HTMLDivElement | null, RadioProps<any>>(
  ({ children, ...props }, maybeOuterRef: any) => {
    const [focus, setFocus] = React.useState(false);
    const ref = React.useRef<HTMLDivElement | null>(null);

    const ctx = React.useContext(RadioGroupContext);
    const { otherRadioValues, value, setChecked } = ctx;
    const index = otherRadioValues.findIndex(i => i == props.value);
    const count = otherRadioValues.length - 1;
    React.useEffect(() => {
      if (value === props.value) {
        console.log('should focus on', ref.current);
        if (maybeOuterRef && maybeOuterRef.current !== null) {
          maybeOuterRef.current.focus();
        } else if (ref.current !== null) {
          ref.current.focus();
        }
      }
    }, [value, props.value, maybeOuterRef]);

    const handleKeyDown = React.useCallback(
      event => {
        event.persist();
        var flag = false;
        console.log(index, count);
        console.log(event.target);
        function setPrevious() {
          if (index === 0) {
            console.log('setPrevious (i == 0)', otherRadioValues[count]);
            setChecked(otherRadioValues[count]);
          } else {
            console.log('setPrevious (i != 0)', otherRadioValues[index - 1]);
            setChecked(otherRadioValues[index - 1]);
          }
        }

        function setNext() {
          console.log('index: ' + index, 'count: ' + count);
          if (index === count) {
            console.log('setNext (i == count)', otherRadioValues[0]);
            setChecked(otherRadioValues[0]);
          } else {
            console.log('setNext (i != count)', otherRadioValues[index + 1]);
            setChecked(otherRadioValues[index + 1]);
          }
        }

        switch (event.keyCode) {
          case codes.SPACE:
          case codes.RETURN:
            setChecked(props.value);
            flag = true;
            break;
          case codes.UP:
          case codes.LEFT:
            setPrevious();
            flag = true;
            break;
          case codes.DOWN:
          case codes.RIGHT:
            setNext();
            flag = true;
            break;
          default:
            break;
        }

        if (flag) {
          event.stopPropagation();
          event.preventDefault();
        }
      },
      [children, otherRadioValues, props.value, count, index]
    );

    const handleClick = React.useCallback(() => {
      setChecked(props.value);
    }, [props.value]);

    const handleBlur = React.useCallback(e => {
      if (props.onBlur) {
        props.onBlur(e);
      }
      setFocus(false);
    }, []);

    const handleFocus = React.useCallback(e => {
      if (props.onFocus) {
        props.onFocus(e);
      }
      setFocus(true);
    }, []);
    return (
      <div
        {...props}
        role="radio"
        tabIndex={value === props.value ? 0 : -1}
        aria-checked={value === props.value}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        data-palmerhq-radio
        data-palmerhq-radio-focus={focus}
        ref={el => {
          if (maybeOuterRef) {
            maybeOuterRef.current = el;
          }
          ref.current = el;
        }}
        children={children}
      />
    );
  }
);

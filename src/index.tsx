import * as React from 'react';
import { forwardRefWithAs } from './forwardRefWithAs';

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
  autoFocus: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupCtx<any>>({} as any);

export interface RadioProps<V> {
  value: V;
  children: React.ReactNode;
  onFocus?: (e: React.FocusEvent<any>) => void;
  onBlur?: (e: any) => void;
}

export interface RadioGroupProps<V = any> {
  labelledBy: string;
  children: React.ReactNode;
  value: V;
  onChange: (value: V) => void;
  autoFocus?: boolean;
}

export const RadioGroup = forwardRefWithAs<RadioGroupProps, 'div'>(
  function RadioGroup(
    {
      labelledBy,
      children,
      value,
      autoFocus = true,
      as: Comp = 'div',
      ...props
    },
    ref
  ) {
    const { onChange } = props;
    const setChecked = React.useCallback(
      v => {
        if (onChange) {
          onChange(v);
        }
      },
      [onChange]
    );

    const otherRadioValues = React.Children.map<any, any>(
      children,
      child => child.props.value
    );
    const ctx = React.useMemo(
      () => ({
        value,
        otherRadioValues,
        setChecked,
        autoFocus,
      }),
      [otherRadioValues, setChecked, autoFocus, value]
    );
    return (
      <RadioGroupContext.Provider value={ctx}>
        <Comp
          ref={ref}
          role="radiogroup"
          aria-labelledby={labelledBy}
          data-palmerhq-radio-group
          {...props}
        >
          {children}
        </Comp>
      </RadioGroupContext.Provider>
    );
  }
);

export const Radio = forwardRefWithAs<RadioProps<any>, 'div'>(function Radio(
  { children, as: Comp = 'div', ...props },
  maybeOuterRef: any
) {
  const [focus, setFocus] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const { onBlur, onFocus } = props;
  const ctx = React.useContext(RadioGroupContext);
  const { otherRadioValues, value, setChecked, autoFocus } = ctx;
  const index = otherRadioValues.findIndex(i => i === props.value);
  const count = otherRadioValues.length - 1;
  const isCurrentRadioSelected = value === props.value;
  const valueProp = props.value;
  React.useEffect(() => {
    if (autoFocus && value === valueProp) {
      if (maybeOuterRef && maybeOuterRef.current !== null) {
        maybeOuterRef.current.focus();
      } else if (ref.current !== null) {
        ref.current.focus();
      }
    }
  }, [value, valueProp, maybeOuterRef, autoFocus]);

  const isFirstRadioOption = index === 0;
  const handleKeyDown = React.useCallback(
    event => {
      event.persist();
      var flag = false;
      function setPrevious() {
        if (isFirstRadioOption) {
          setChecked(otherRadioValues[count]);
        } else {
          setChecked(otherRadioValues[index - 1]);
        }
      }

      function setNext() {
        if (index === count) {
          setChecked(otherRadioValues[0]);
        } else {
          setChecked(otherRadioValues[index + 1]);
        }
      }

      switch (event.keyCode) {
        case codes.SPACE:
        case codes.RETURN:
          setChecked(valueProp);
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
    [isFirstRadioOption, setChecked, otherRadioValues, count, index, valueProp]
  );

  const handleClick = React.useCallback(() => {
    setChecked(valueProp);
  }, [setChecked, valueProp]);

  const handleBlur = React.useCallback(
    e => {
      if (onBlur) {
        onBlur(e);
      }
      setFocus(false);
    },
    [onBlur]
  );

  const handleFocus = React.useCallback(
    e => {
      if (onFocus) {
        onFocus(e);
      }
      setFocus(true);
    },
    [onFocus]
  );

  const noValueSelected = !value;
  const tabIndex =
    isCurrentRadioSelected || (noValueSelected && isFirstRadioOption) ? 0 : -1;
  return (
    <Comp
      {...props}
      role="radio"
      tabIndex={tabIndex}
      aria-checked={isCurrentRadioSelected}
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
});

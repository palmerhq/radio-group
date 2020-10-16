import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Radio, RadioGroup } from '../src';

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <RadioGroup name="color" onChange={() => {}}>
        <Radio value="red">Foo</Radio>
        <Radio value="green">Biz</Radio>
        <Radio value="blue">Boop</Radio>
      </RadioGroup>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});

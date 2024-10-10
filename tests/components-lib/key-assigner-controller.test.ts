import { describe, expect, it, vi } from 'vitest';
import { KeyAssignerController } from '../../src/components-lib/key-assigner-controller';
import { createLitElement } from '../test-utils';

// @vitest-environment jsdom
describe('KeyAssignerController', () => {
  it('should be creatable', () => {
    const controller = new KeyAssignerController(createLitElement());
    expect(controller).toBeTruthy();
  });

  describe('should manage value', () => {
    it('should have no value to start', () => {
      const controller = new KeyAssignerController(createLitElement());
      expect(controller.hasValue()).toBeFalsy();
    });

    it('should set value', () => {
      const element = createLitElement();
      const valueChangeHandler = vi.fn();
      element.addEventListener('value-changed', valueChangeHandler);
      const controller = new KeyAssignerController(element);

      controller.setValue({ key: 'ArrowLeft' });

      expect(controller.hasValue()).toBeTruthy();
      expect(controller.getValue()).toEqual({ key: 'ArrowLeft' });
      expect(element.requestUpdate).toBeCalled();
      expect(valueChangeHandler).toBeCalledWith(
        expect.objectContaining({
          detail: { value: { key: 'ArrowLeft' } },
        }),
      );

      // Set again with the same value.
      controller.setValue({ key: 'ArrowLeft' });
      expect(element.requestUpdate).toBeCalledTimes(1);
      expect(valueChangeHandler).toBeCalledTimes(1);
    });
  });

  describe('should manage assignment state', () => {
    it('should not be assigned to start', () => {
      const element = createLitElement();
      const controller = new KeyAssignerController(element);
      expect(controller.isAssigning()).toBeFalsy();
      expect(element.getAttribute('assigning')).toBeNull();
    });

    it('should toggle assigning', () => {
      const element = createLitElement();
      const controller = new KeyAssignerController(element);
      controller.toggleAssigning();
      expect(element.requestUpdate).toBeCalled();
      expect(controller.isAssigning()).toBeTruthy();
      expect(element.getAttribute('assigning')).toBe('');

      expect(controller.hasValue()).toBeFalsy();
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));

      expect(controller.hasValue()).toBeTruthy();
      expect(controller.isAssigning()).toBeFalsy();

      controller.setValue(null);

      // A key sent when not assigning will do nothing.
      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      expect(controller.hasValue()).toBeFalsy();
    });

    it('should not assign when focus lost', () => {
      const element = createLitElement();
      const controller = new KeyAssignerController(element);

      controller.hostConnected();

      controller.toggleAssigning();
      expect(controller.isAssigning()).toBeTruthy();

      element.dispatchEvent(new FocusEvent('blur'));
      expect(controller.isAssigning()).toBeFalsy();

      controller.hostDisconnected();
    });
  });

  describe('should manage key down', () => {
    it('should reject modifiers only', () => {
      const element = createLitElement();
      const controller = new KeyAssignerController(element);
      controller.toggleAssigning();

      element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
      expect(controller.hasValue()).toBeFalsy();
    });

    it('should reject empty key', () => {
      const element = createLitElement();
      const controller = new KeyAssignerController(element);
      controller.toggleAssigning();

      element.dispatchEvent(new KeyboardEvent('keydown', { key: '' }));
      expect(controller.hasValue()).toBeFalsy();
    });

    it('should accept valid key', () => {
      const element = createLitElement();
      const controller = new KeyAssignerController(element);
      controller.toggleAssigning();

      element.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          ctrlKey: true,
          shiftKey: true,
          altKey: true,
          metaKey: true,
        }),
      );
      expect(controller.hasValue()).toBeTruthy();
      expect(controller.getValue()).toEqual({
        key: 'ArrowLeft',
        ctrl: true,
        shift: true,
        alt: true,
        meta: true,
      });
      expect(controller.isAssigning()).toBeFalsy();
    });
  });
});

import React, { useEffect, useRef, useState } from 'react';
import { resolveWidgetFieldValue } from '@/_helpers/utils';

import * as Icons from '@tabler/icons-react';
import Loader from '@/ToolJetUI/Loader/Loader';
import SolidIcon from '@/_ui/Icon/SolidIcons';
import Label from '@/_ui/Label';

export const PasswordInput = function PasswordInput({
  height,
  validate,
  properties,
  styles,
  setExposedVariable,
  fireEvent,
  component,
  darkMode,
  dataCy,
  isResizing,
}) {
  const textInputRef = useRef();
  const labelRef = useRef();

  const { loadingState, disabledState, label, placeholder } = properties;
  const {
    padding,
    borderRadius,
    borderColor,
    backgroundColor,
    textColor,
    boxShadow,
    width,
    alignment,
    direction,
    color,
    auto,
    errTextColor,
    iconColor,
    accentColor,
  } = styles;

  const [disable, setDisable] = useState(disabledState || loadingState);
  const [passwordValue, setPasswordValue] = useState(properties.value);
  const [visibility, setVisibility] = useState(properties.visibility);
  const { isValid, validationError } = validate(passwordValue);
  const [showValidationError, setShowValidationError] = useState(false);

  const isMandatory = resolveWidgetFieldValue(component?.definition?.validation?.mandatory?.value);
  const [labelWidth, setLabelWidth] = useState(0);
  const defaultAlignment = alignment === 'side' || alignment === 'top' ? alignment : 'side';
  const [iconVisibility, setIconVisibility] = useState(false);
  const [loading, setLoading] = useState(loadingState);
  const [isFocused, setIsFocused] = useState(false);
  const tinycolor = require('tinycolor2');

  const _width = (width / 100) * 70; // Max width which label can go is 70% for better UX calculate width based on this value

  const computedStyles = {
    height: height == 36 ? (padding == 'default' ? '36px' : '40px') : padding == 'default' ? height : height + 4,
    borderRadius: `${borderRadius}px`,
    backgroundColor: !['#ffffff', '#fff'].includes(backgroundColor)
      ? backgroundColor
      : disable || loading
      ? darkMode
        ? 'var(--surfaces-app-bg-default)'
        : 'var(--surfaces-surface-03)'
      : 'var(--surfaces-surface-01)',
    boxShadow: boxShadow,
    padding: component?.definition?.styles?.iconVisibility?.value ? '8px 10px 8px 29px' : '8px 10px 8px 10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: textColor !== '#1B1F24' ? textColor : disable || loading ? 'var(--text-disabled)' : 'var(--text-primary)',
    borderColor: isFocused
      ? accentColor != '4368E3'
        ? accentColor
        : 'var(--primary-accent-strong)'
      : borderColor != '#CCD1D5'
      ? borderColor
      : disable || loading
      ? '1px solid var(--borders-disabled-on-white)'
      : 'var(--borders-default)',
    '--tblr-input-border-color-darker': tinycolor(borderColor).darken(24).toString(),
  };

  const loaderStyle = {
    right:
      direction === 'right' &&
      defaultAlignment === 'side' &&
      ((label?.length > 0 && width > 0) || (auto && width == 0 && label && label?.length != 0))
        ? `${labelWidth + 11}px`
        : '11px',
    top: `${
      defaultAlignment === 'top'
        ? ((label?.length > 0 && width > 0) || (auto && width == 0 && label && label?.length != 0)) &&
          'calc(50% + 10px)'
        : ''
    }`,
    transform:
      defaultAlignment === 'top' &&
      ((label?.length > 0 && width > 0) || (auto && width == 0 && label && label?.length != 0)) &&
      ' translateY(-50%)',
    zIndex: 3,
  };

  useEffect(() => {
    setExposedVariable('label', label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [label]);

  useEffect(() => {
    if (labelRef?.current) {
      const absolutewidth = labelRef?.current?.getBoundingClientRect()?.width;
      setLabelWidth(absolutewidth);
    } else setLabelWidth(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isResizing,
    width,
    auto,
    defaultAlignment,
    component?.definition?.styles?.iconVisibility?.value,
    label?.length,
    isMandatory,
    padding,
    direction,
    alignment,
    isMandatory,
    labelRef?.current?.getBoundingClientRect()?.width,
  ]);

  useEffect(() => {
    disable !== disabledState && setDisable(disabledState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledState]);

  useEffect(() => {
    visibility !== properties.visibility && setVisibility(properties.visibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.visibility]);

  useEffect(() => {
    loading !== loadingState && setLoading(loadingState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingState]);

  useEffect(() => {
    setExposedVariable('isValid', isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid]);

  useEffect(() => {
    setPasswordValue(properties.value);
    setExposedVariable('value', properties?.value ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.value]);

  useEffect(() => {
    setExposedVariable('setFocus', async function () {
      textInputRef.current.focus();
    });
    setExposedVariable('setBlur', async function () {
      textInputRef.current.blur();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setExposedVariable('setText', async function (text) {
      setPasswordValue(text);
      setExposedVariable('value', text);
      fireEvent('onChange');
    });
    setExposedVariable('clear', async function () {
      setPasswordValue('');
      setExposedVariable('value', '');
      fireEvent('onChange');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPasswordValue]);

  const iconName = styles.icon; // Replace with the name of the icon you want
  // eslint-disable-next-line import/namespace
  const IconElement = Icons[iconName] == undefined ? Icons['IconHome2'] : Icons[iconName];
  // eslint-disable-next-line import/namespace

  useEffect(() => {
    setExposedVariable('isMandatory', isMandatory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMandatory]);

  useEffect(() => {
    setExposedVariable('isLoading', loading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    setExposedVariable('setLoading', async function (loading) {
      setLoading(loading);
      setExposedVariable('isLoading', loading);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.loadingState]);

  useEffect(() => {
    setExposedVariable('isVisible', visibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibility]);

  useEffect(() => {
    setExposedVariable('setVisibility', async function (state) {
      setVisibility(state);
      setExposedVariable('isVisible', state);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties.visibility]);

  useEffect(() => {
    setExposedVariable('setDisable', async function (disable) {
      setDisable(disable);
      setExposedVariable('isDisabled', disable);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabledState]);

  useEffect(() => {
    setExposedVariable('isDisabled', disable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disable]);

  const renderInput = () => (
    <>
      <div
        data-cy={`label-${String(component.name).toLowerCase()}`}
        className={`text-input  d-flex  ${
          defaultAlignment === 'top' &&
          ((width != 0 && label && label?.length != 0) || (auto && width == 0 && label && label?.length != 0))
            ? 'flex-column'
            : 'align-items-center '
        }  ${direction === 'right' && defaultAlignment === 'side' ? 'flex-row-reverse' : ''}
      ${direction === 'right' && defaultAlignment === 'top' ? 'text-right' : ''}
      ${visibility || 'invisible'}`}
        style={{
          position: 'relative',
          whiteSpace: 'nowrap',
          width: '100%',
        }}
      >
        <Label
          label={label}
          width={width}
          labelRef={labelRef}
          darkMode={darkMode}
          color={color}
          defaultAlignment={defaultAlignment}
          direction={direction}
          auto={auto}
          isMandatory={isMandatory}
          _width={_width}
          labelWidth={labelWidth}
        />
        {component?.definition?.styles?.iconVisibility?.value && !isResizing && (
          <IconElement
            data-cy={'text-input-icon'}
            style={{
              width: '16px',
              height: '16px',
              left:
                direction === 'right'
                  ? '11px'
                  : defaultAlignment === 'top'
                  ? '11px'
                  : (label?.length > 0 && width > 0) || (auto && width == 0 && label && label?.length != 0)
                  ? `${labelWidth + 11}px`
                  : '11px', //11 ::  is 10 px inside the input + 1 px border + 12px margin right
              position: 'absolute',
              top: `${
                defaultAlignment === 'side'
                  ? '50%'
                  : (label?.length > 0 && width > 0) || (auto && width == 0 && label && label?.length != 0)
                  ? 'calc(50% + 10px)'
                  : '50%'
              }`,
              transform: ' translateY(-50%)',
              color: iconColor !== '#CFD3D859' ? iconColor : 'var(--icons-weak-disabled)',
              zIndex: 3,
            }}
            stroke={1.5}
          />
        )}
        {!loading && !isResizing && (
          <div
            onClick={() => {
              setIconVisibility(!iconVisibility);
            }}
            style={{
              width: '16px',
              height: '16px',
              position: 'absolute',
              right:
                direction === 'right' &&
                defaultAlignment === 'side' &&
                ((label?.length > 0 && width > 0) || (auto && width == 0 && label && label?.length != 0))
                  ? `${labelWidth + 11}px`
                  : '11px',
              top: `${
                defaultAlignment === 'top'
                  ? ((label?.length > 0 && width > 0) || (auto && width == 0 && label && label?.length != 0)) &&
                    'calc(50% + 10px)'
                  : ''
              }`,
              transform:
                defaultAlignment === 'top' &&
                ((label?.length > 0 && width > 0) || (auto && width == 0 && label && label?.length != 0)) &&
                ' translateY(-50%)',
              display: 'flex',
              zIndex: 3,
            }}
            stroke={1.5}
          >
            <SolidIcon
              width={16}
              fill={'var(--icons-weak-disabled)'}
              className="password-component-eye"
              name={!iconVisibility ? 'eye1' : 'eyedisable'}
            />
          </div>
        )}
        <input
          data-cy={dataCy}
          className={`tj-text-input-widget ${
            !isValid && showValidationError ? 'is-invalid' : ''
          } validation-without-icon `}
          ref={textInputRef}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              setPasswordValue(e.target.value);
              setExposedVariable('value', e.target.value);
              fireEvent('onEnterPressed');
            }
          }}
          onChange={(e) => {
            setPasswordValue(e.target.value);
            setExposedVariable('value', e.target.value);
            fireEvent('onChange');
          }}
          onBlur={(e) => {
            setIsFocused(false);
            setShowValidationError(true);
            e.stopPropagation();
            fireEvent('onBlur');
          }}
          onFocus={(e) => {
            setIsFocused(true);
            e.stopPropagation();
            setTimeout(() => {
              fireEvent('onFocus');
            }, 0);
          }}
          type={!iconVisibility ? 'password' : 'text'}
          placeholder={placeholder}
          style={computedStyles}
          value={passwordValue}
          disabled={disable || loading}
        />
        {loading && <Loader style={{ ...loaderStyle }} width="16" />}
      </div>
      {showValidationError && visibility && (
        <div
          data-cy={`${String(component.name).toLowerCase()}-invalid-feedback`}
          style={{
            color: errTextColor !== '#D72D39' ? errTextColor : 'var(--status-error-strong)',
            textAlign: direction == 'left' && 'end',
            fontSize: '11px',
            fontWeight: '400',
            lineHeight: '16px',
          }}
        >
          {showValidationError && validationError}
        </div>
      )}
    </>
  );

  return <div>{renderInput()}</div>;
};

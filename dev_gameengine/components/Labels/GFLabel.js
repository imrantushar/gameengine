import React from 'react';
import { __ } from '@wordpress/i18n';
import { Icon } from '@GFUtils/ui';
import { FaLock } from 'react-icons/fa6';
import { is_pro } from '@GFUtils/helper';
const GFLabel = ({
  type = "title",
  label = "",
  fontSize,
  fontWeight,
  textTransform,
  margin,
  padding,
  color,
  bg,
  borderRadius,
  textAlign,
  borderBottom,
  borderColor,
  whiteSpace,
  lineHeight,
  width,
  isPro = false
}) => {
  const variantStyles = {
    heading: {
      fontSize: "20px",
      fontWeight: "500",
      color: "var(--gameengine-font-color)",
      lineHeight: "30px"
    },
    plainHeading: {
      fontSize: "20px",
      fontWeight: "500",
      color: "var(--gameengine-font-color)",
      lineHeight: "30px",
      margin: "0 0 24px 0",
      padding: "0",
      borderBottom: "none"
    },
    title: {
      fontSize: "14px",
      fontWeight: "600",
      lineHeight: "20px",
      color: "var(--gameengine-font-color)",
      margin: "0"
    },
    input: {
      fontSize: "14px",
      fontWeight: "500",
      lineHeight: "20px",
      color: "var(--gameengine-font-color)",
      margin: "0"
    },
    subtitle: {
      fontSize: "12px",
      fontWeight: "400",
      lineHeight: "16px",
      color: "#101828",
      margin: "0"
    },
    basic: {
      fontSize: "14px",
      fontWeight: "500",
      color: "var(--gameengine-font-color)"
    },
    label: {
      fontSize: "14px",
      fontWeight: "400",
      color: "var(--gameengine-font-color)"
    },
    simple: {
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "16px",
      color: "#738496",
      margin: "0"
    }
  };
  const styles = variantStyles[type] || variantStyles.title;
  const autoPro = typeof label === 'string' && (label.includes('(Pro)') || label.includes('(PRO)'));
  const showPro = (isPro || autoPro) && !is_pro;
  let displayLabel = label;
  if (typeof label === 'string' && is_pro) {
    displayLabel = label.replace(/\s*\(Pro\)/gi, '').trim();
  }
  const textStyle = {
    fontFamily: "var(--gameengine-font)",
    fontSize: fontSize ?? styles.fontSize,
    fontWeight: fontWeight ?? styles.fontWeight,
    color: color ?? styles.color,
    lineHeight: lineHeight ?? styles.lineHeight,
    margin: margin ?? styles.margin,
    padding: padding ?? styles.padding,
    borderBottom: borderBottom ?? styles.borderBottom,
    textTransform,
    background: bg,
    borderRadius,
    textAlign,
    borderColor,
    whiteSpace,
    width
  };
  return <div className="flex items-center gap-2" style={{
    ...textStyle
  }}>
			{typeof label === 'string' ? <p style={textStyle}>{displayLabel}</p> : <div className="flex" style={textStyle}>{displayLabel}</div>}
			{showPro && <div className="flex items-center gap-1.5">
					<p className="items-center m-0 text-white rounded-sm leading-none uppercase inline-flex bg-[#FFA943] [padding:3px_6px] text-[10px]">{__("PRO", 'gameengine')}</p>
					<Icon as={FaLock} color="orange.400" boxSize={3} />
				</div>}
		</div>;
};
export default GFLabel;
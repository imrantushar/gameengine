import { Icon } from '@GFComponents/UI';
import { FaLock } from 'react-icons/fa6';
import { __ } from '@wordpress/i18n';

/**
 * A settings row component that displays a label and an input control side by side.
 *
 * @component
 * @param {Object}          props
 * @param {string}          props.label              - The label text displayed on the left side.
 * @param {string}          [props.desc]             - Optional description (reserved for future use).
 * @param {React.ReactNode} props.children           - The input control rendered on the right side.
 * @param {string}          [props.width="100%"]     - Width of the container. Defaults to "100%".
 * @param {boolean}         [props.isPro=false]      - If true, displays a PRO badge next to the label.
 * @param {React.ReactNode} [props.subtitle=null]    - Optional subtitle rendered below the label.
 *
 * @example
 * <SettingsInput label="Log Display" isPro>
 *   <Select options={options} />
 * </SettingsInput>
 *
 * @example
 * <SettingsInput label="Auto Cleanup" subtitle={<Text>Cleans up after 24h</Text>}>
 *   <Switch />
 * </SettingsInput>
 */
const SettingsInput = ({
  label,
  desc,
  children,
  isPro = false,
  subtitle = null,
  ...props
}) => {
  const ProBadge = isPro && <div className="flex items-center gap-1.5 ml-2">
            <p className="items-center m-0 text-white rounded-sm leading-none uppercase inline-flex bg-[#FFA943] px-1.5 py-[3px] text-[10px]">
                {__("PRO", 'gameengine')}
            </p>
            <Icon as={FaLock} color="orange.400" boxSize={3} />
        </div>;
  const Label = <div className="flex items-center">
            <p className="text-sm font-medium leading-5 m-0 text-[var(--gameengine-font-color)]">
                {label}
            </p>
            {ProBadge}
        </div>;
  return <div className="flex flex-row justify-between items-center gap-4 w-full py-3 border-0" {...props}>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                {Label}
                {subtitle && subtitle}
            </div>
            <div className="shrink-0 flex items-center justify-end w-[260px]">
                {children}
            </div>
        </div>;
};
export default SettingsInput;
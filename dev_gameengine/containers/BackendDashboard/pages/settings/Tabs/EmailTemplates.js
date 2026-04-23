import React, { useState } from 'react';
import { Switch, Dialog, Portal } from '@GFComponents/UI';
import { __ } from "@wordpress/i18n";
import GFLabel from '@GFComponents/Labels/GFLabel';
import SettingsInput from '../Components/SettingsInput';
import GameEngineBox from '@GFComponents/GameEngineBox';
import { useFormikContext } from 'formik';
import { commonInput, outlineBtn, primaryBtn, transparentMiniBtn } from '../../../../../../assets/scss/chakra/recipe';
import GameEngineEditor from '@GFComponents/editor';
const EmailTemplates = ({
  handleSubmit,
  isSubmitting,
  dirty
}) => {
  const {
    values,
    setFieldValue,
    handleChange
  } = useFormikContext();
  const [editingKey, setEditingKey] = useState(null);
  const emailConfigs = {
    level: {
      title: __("Level Up Email", "gameengine"),
      desc: __("Sent when a user reaches a new level.", "gameengine"),
      tags: ['{user_name}', '{level_name}', '{site_name}'],
      subjectField: 'email_templates.level_subject',
      bodyField: 'email_templates.level_body',
      enabledField: 'email_templates.level_enabled',
      userEnabledField: 'email_templates.level_user_enabled',
      adminEnabledField: 'email_templates.level_admin_enabled',
      defaultSubject: 'Congratulations! You reached {level_name}',
      defaultBody: 'Hi {user_name},<br><br>You reached {level_name}!'
    },
    achievement: {
      title: __("Achievement Unlocked Email", "gameengine"),
      desc: __("Sent when a user unlocks a new achievement.", "gameengine"),
      tags: ['{user_name}', '{achievement_name}', '{site_name}'],
      subjectField: 'email_templates.achievement_subject',
      bodyField: 'email_templates.achievement_body',
      enabledField: 'email_templates.achievement_enabled',
      userEnabledField: 'email_templates.achievement_user_enabled',
      adminEnabledField: 'email_templates.achievement_admin_enabled',
      defaultSubject: 'New Achievement Unlocked: {achievement_name}',
      defaultBody: 'Hi {user_name},<br><br>You unlocked {achievement_name}!'
    },
    inactivity: {
      title: __("Inactivity Nudge Email", "gameengine"),
      desc: __("Sent when a user has been inactive.", "gameengine"),
      tags: ['{user_name}', '{points_balance}', '{site_name}'],
      subjectField: 'email_templates.inactivity_subject',
      bodyField: 'email_templates.inactivity_body',
      enabledField: 'email_templates.inactivity_enabled',
      userEnabledField: 'email_templates.inactivity_user_enabled',
      adminEnabledField: 'email_templates.inactivity_admin_enabled',
      defaultSubject: 'We miss you! You have {points_balance} points waiting.',
      defaultBody: 'Hi {user_name},<br><br>Come back to use your {points_balance} points.'
    },
    milestone: {
      title: __("Points Milestone Alert", "gameengine"),
      desc: __("Sent every multiple of 500 points.", "gameengine"),
      tags: ['{user_name}', '{points_balance}', '{next_level}', '{points_to_next}'],
      subjectField: 'email_templates.milestone_subject',
      bodyField: 'email_templates.milestone_body',
      enabledField: 'email_templates.milestone_enabled',
      userEnabledField: 'email_templates.milestone_user_enabled',
      adminEnabledField: 'email_templates.milestone_admin_enabled',
      defaultSubject: 'You reached a milestone! {points_balance} Points!',
      defaultBody: 'Hi {user_name},<br><br>You only need {points_to_next} points to reach {next_level}.'
    }
  };
  const handleCopyTag = tag => {
    navigator.clipboard.writeText(tag);
  };
  const CustomSwitch = ({
    isChecked,
    onChange
  }) => <Switch.Root colorPalette="blue" size="sm" checked={isChecked} onCheckedChange={details => onChange(details.checked)}>
            <Switch.HiddenInput />
            <Switch.Control />
        </Switch.Root>;
  return <div className="w-full overflow-visible">
            {/* General Settings */}
            <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" overflow="visible" mb="30px">
                <p className="text-xl font-medium text-[var(--gameengine-font-color)] [border-bottom:1px_solid_var(--gameengine-border-color)]" style={{
        "lineHeight": "30px",
        "margin": "0 0 24px 0",
        "padding": "0 0 16px 0"
      }}>
                    {__("General", "gameengine")}
                </p>

                <div className="flex flex-col gap-4">
                    <SettingsInput label={__("Name", "gameengine")} subtitle={<p className="text-xs m-0" style={{
          "color": "#738496"
        }}>{__("The common name for all outgoing emails.", "gameengine")}</p>}>
                        <input name="email_templates.sender_name" value={values?.email_templates?.sender_name || 'GameEngine LMS'} onChange={handleChange} style={commonInput} />
                    </SettingsInput>
                    <SettingsInput label={__("E-Mail Address", "gameengine")} subtitle={<p className="text-xs m-0" style={{
          "color": "#738496"
        }}>{__("All emails will be sent from this email address.", "gameengine")}</p>}>
                        <input name="email_templates.sender_email" value={values?.email_templates?.sender_email || 'admin@yoursite.com'} onChange={handleChange} style={commonInput} />
                    </SettingsInput>
                </div>
            </GameEngineBox>

            {/* Templates List */}
            <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" overflow="visible">
                <p className="text-xl font-medium text-[var(--gameengine-font-color)] [border-bottom:1px_solid_var(--gameengine-border-color)]" style={{
        "lineHeight": "30px",
        "margin": "0 0 24px 0",
        "padding": "0 0 16px 0"
      }}>
                    {__("Email Template", "gameengine")}
                </p>

                <div className="flex flex-col gap-4">
                    {Object.entries(emailConfigs).map(([key, config]) => {
          return <div className="flex items-center justify-between rounded-md bg-white [border:1px_solid_var(--gameengine-border-color)]" style={{
            "padding": "16px 20px"
          }} key={key}>
                                <div>
                                    <p className="text-base font-semibold m-0 text-[var(--gameengine-font-color)]">
                                        {config.title}
                                    </p>
                                    <p className="text-sm m-0" style={{
                "color": "#738496"
              }}>
                                        {config.desc}
                                    </p>
                                </div>

                                <div className="flex items-center gap-5">
                                    <Dialog.Root size="cover" placement="center" motionPreset="slide-in-bottom" onOpenChange={() => setEditingKey(key)} maxW="1230px">
                                        <Dialog.Trigger asChild>
                                            <button className="flex gap-1.5" style={{
                    ...outlineBtn
                  }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                {__("Edit Template", "gameengine")}
                                            </button>
                                        </Dialog.Trigger>
                                        <Portal>
                                            <Dialog.Backdrop />
                                            <Dialog.Positioner style={{
                    zIndex: "9999"
                  }}>
                                                <Dialog.Content>
                                                    <Dialog.Body p={6}>
                                                        <div className="flex justify-between items-center gap-2 [border-bottom:1px_solid_var(--gameengine-border-color)]" style={{
                          "paddingRight": "50px",
                          "paddingBottom": "20px"
                        }}>
                                                            <GFLabel type="heading" margin='0' label={config.title} />
                                                            <button className="h-auto" style={{
                            "padding": "7px 14px",
                            ...primaryBtn
                          }} onClick={handleSubmit} disabled={!dirty}>
                                                                {__('Save Changes', 'gameengine')}
                                                            </button>
                                                        </div>
                                                        <div className="w-full overflow-visible">
                                                            <div className="flex items-center mb-5">
                                                                <div className="flex items-center gap-2.5">
                                                                    <p className="text-sm font-medium">{__("Notify User", "gameengine")}</p>
                                                                    <CustomSwitch isChecked={values?.email_templates?.[editingKey + '_user_enabled'] ?? true} onChange={val => setFieldValue(config.userEnabledField, val)} />
                                                                </div>
                                                                <div className="flex items-center gap-2.5" style={{
                              "marginLeft": "20px"
                            }}>
                                                                    <p className="text-sm font-medium">{__("Notify Admin", "gameengine")}</p>
                                                                    <CustomSwitch isChecked={values?.email_templates?.[editingKey + '_admin_enabled'] ?? false} onChange={val => setFieldValue(config.adminEnabledField, val)} />
                                                                </div>
                                                            </div>

                                                            <div className="flex" style={{
                            "gap": "30px"
                          }} align="start">
                                                                {/* Left Column: Editor */}
                                                                <div className="flex-1 min-w-0">
                                                                    <GameEngineBox dynamicClasses='gameengine-settings' boxShadow="var(--gameengine-shadow)" overflow="visible">
                                                                        <div className="flex items-start gap-3 mb-6">
                                                                            <p className="text-sm font-medium leading-5 text-[var(--gameengine-font-color)]" style={{
                                    "margin": "0 0 8px 0"
                                  }}>
                                                                                {__("Subject:", "gameengine")}
                                                                            </p>

                                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                                {config.tags.map(tag => <button style={{
                                      "background": "#f3f4f6",
                                      "border": "none"
                                    }} key={tag} style={transparentMiniBtn} onClick={() => handleCopyTag(tag)} title={__("Click to copy", "gameengine")}>
                                                                                        {tag}
                                                                                    </button>)}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        <input name={config.subjectField} value={values?.email_templates?.[editingKey + '_subject'] || ''} onChange={handleChange} placeholder={config.defaultSubject} style={commonInput} />

                                                                        {editingKey === 'inactivity' && <SettingsInput mt="20px" label={__("Inactivity Days", "gameengine")}>
                                                                                <input style={{
                                    "width": "100px"
                                  }} type="number" name="email_templates.inactivity_days" value={values?.email_templates?.inactivity_days || '7'} onChange={handleChange} style={commonInput} />
                                                                            </SettingsInput>}

                                                                        <p className="text-sm font-medium leading-5 text-[var(--gameengine-font-color)]" style={{
                                  "margin": "24px 0 8px 0"
                                }}>
                                                                            {__("Additional Content", "gameengine")}
                                                                        </p>

                                                                        <GameEngineEditor name={config.bodyField} defaultValue={values?.email_templates?.[editingKey + '_body'] || config.defaultBody} saveValueHandler={(name, content) => setFieldValue(name, content)} suffix={`email-template-${editingKey}`} />
                                                                    </GameEngineBox>
                                                                </div>

                                                                {/* Right Column: Live Preview */}
                                                                <div className="flex-1 min-w-0 sticky" style={{
                              "top": "130px"
                            }}>
                                                                    <p className="justify-between text-base font-semibold mb-2 flex" style={{
                                "color": "#738496"
                              }}>
                                                                        {__("Template Preview", "gameengine")}
                                                                    </p>

                                                                    <div className="rounded-lg [border:1px_solid_var(--gameengine-border-color)]" style={{
                                "background": "#f8f9fa",
                                "padding": "30px"
                              }}>
                                                                        <div className="bg-white rounded-lg" style={{
                                  "padding": "30px",
                                  "boxShadow": "0 4px 12px rgba(0,0,0,0.06)"
                                }}>
                                                                            <p className="text-xl font-semibold mb-4" style={{
                                    "color": "#111",
                                    "borderBottom": "1px solid #f0f0f0",
                                    "paddingBottom": "15px"
                                  }}>
                                                                                {values?.email_templates?.[editingKey + '_subject'] || config.defaultSubject}
                                                                            </p>
                                                                            <div className="ql-editor p-0" style={{
                                    "color": "#555",
                                    "lineHeight": "1.6"
                                  }} dangerouslySetInnerHTML={{
                                    __html: values?.email_templates?.[editingKey + '_body'] || config.defaultBody
                                  }} />
                                                                            <div style={{
                                    "marginTop": "30px",
                                    "paddingTop": "20px",
                                    "borderTop": "1px solid #f0f0f0"
                                  }}>
                                                                                <p className="text-sm font-semibold" style={{
                                      "color": "#333"
                                    }}>Thank You</p>
                                                                                <p style={{
                                      "fontSize": "13px",
                                      "color": "#888"
                                    }}>{values?.email_templates?.sender_name || 'GameEngine'}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Dialog.Body>
                                                    <Dialog.CloseTrigger asChild>
                                                        <button className="[border:1px_solid_var(--gameengine-border-color)]" style={{
                          "top": "6",
                          "right": "6",
                          "borderRadius": "1"
                        }} />
                                                    </Dialog.CloseTrigger>
                                                </Dialog.Content>
                                            </Dialog.Positioner>
                                        </Portal>
                                    </Dialog.Root>

                                    <div className="flex items-center" style={{
                "gap": "15px"
              }}>
                                        <div className="flex items-center gap-2">
                                            <p style={{
                    "fontSize": "13px",
                    "color": "#555"
                  }}>{__("User:", "gameengine")}</p>
                                            <CustomSwitch isChecked={values?.email_templates?.[key + '_user_enabled'] ?? true} onChange={val => {
                    setFieldValue(config.userEnabledField, val);
                    handleSubmit();
                  }} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p style={{
                    "fontSize": "13px",
                    "color": "#555"
                  }}>{__("Admin:", "gameengine")}</p>
                                            <CustomSwitch isChecked={values?.email_templates?.[key + '_admin_enabled'] ?? false} onChange={val => {
                    setFieldValue(config.adminEnabledField, val);
                    handleSubmit();
                  }} />
                                        </div>
                                    </div>
                                </div>
                            </div>;
        })}
                </div>
            </GameEngineBox>
        </div>;
};
export default EmailTemplates;
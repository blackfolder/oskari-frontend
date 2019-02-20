import React from 'react';
import {withContext} from '../../../../src/reactUtil/genericContext';

const handleChange = (service, properties, value) => {
    if (properties.valueType === 'int') {
        value = parseInt(value);
    }
    service.getStateService().updateActiveClassification(properties.id, value);
};

const ClassificationSelect = ({properties, options, value, service, disabled}) => {
    // options => array of values [1,3,4,5] or array of objects with properties: value and optionally: text, hidden, disabled
    return (
        <div className={properties.class}>
            <div className="label">{properties.label}</div>
            <div className = "select">
                <select className="select" value={value} disabled = {disabled} onChange={(evt) => handleChange(service, properties, evt.target.value)}>
                    {options.map(opt => {
                        if (opt.value !== undefined && opt.hidden) {
                            return <option className = "oskari-hidden" disabled = {opt.disabled ? true : null} key= {'hidden_' + opt.value} value = {opt.value}>{opt.text || opt.value}</option>;
                        } else if (opt.value !== undefined) {
                            return <option key= {opt.value} disabled = {opt.disabled ? true : null} value = {opt.value}>{opt.text || opt.value}</option>;
                        }
                        return <option key= {opt} value = {opt}>{opt}</option>;
                    })}
                </select>
            </div>
        </div>
    );
};
export default withContext(ClassificationSelect);

import React from 'react'

const Select = ({
    label = '',
    name = '',
    className = '',
    inputClassName = '',
    isRequired = true,
    onChange = () => {},
    options = ['Male', 'Female']
}) => {
  return (
    <div className={`${className}`}>
        <label for={name} className="block text-sm font-medium text-gray-800">{label}</label>
        <select id={name}  className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${inputClassName}`} required={isRequired} onChange={onChange}>
            {options.map((item) => (<option key={item} value={item}>
                {item}
            </option>))}
        </select>
    </div>
  )
}

export default Select
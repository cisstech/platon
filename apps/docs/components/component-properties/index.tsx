import { useState } from 'react'
import styles from './styles.module.css'

interface PropertyItemProps {
  name: string
  property: any
  nested?: boolean
}

export function PropertyItem({ name, property, nested = false }: PropertyItemProps) {
  const [expanded, setExpanded] = useState(false)

  // Check if property is expandable (has properties or items)
  const isExpandable =
    (property.type === 'object' && property.properties) ||
    (property.type === 'array' && property.items && property.items.properties)

  // Get type display name
  const getTypeName = () => {
    if (property.enum) {
      return property.enum.join(' | ')
    }

    if (Array.isArray(property.type)) {
      return property.type.join(' | ')
    }

    if (property.type === 'array') {
      if (property.items && property.items.type) {
        return `Array<${property.items.type}>`
      }
      return 'Array'
    }

    return property.type || 'any'
  }

  // Display default value
  const getDefaultValue = () => {
    if (property.default === undefined) return null

    try {
      if (typeof property.default === 'string') {
        return `"${property.default}"`
      }
      return JSON.stringify(property.default)
    } catch (e) {
      return 'Complex object'
    }
  }

  // Get nested properties if any
  const getNestedProperties = () => {
    if (property.type === 'object' && property.properties) {
      return property.properties
    }

    if (property.type === 'array' && property.items && property.items.properties) {
      return property.items.properties
    }

    return null
  }

  const nestedProperties = getNestedProperties()

  return (
    <div className={`${styles.propertyItem} ${nested ? styles.nestedProperty : ''}`}>
      <div className={styles.propertyKey}>
        <code>{name}</code>
      </div>

      <div className={styles.propertyDetails}>
        <div className={styles.propertyDescription}>{property.description}</div>

        <div className={styles.propertyType}>
          {isExpandable ? (
            <span
              className={`${styles.toggle} ${expanded ? styles.expanded : styles.collapsed}`}
              onClick={() => setExpanded(!expanded)}
            >
              {getTypeName()}
            </span>
          ) : (
            getTypeName()
          )}
        </div>

        {getDefaultValue() !== null && (
          <div className={styles.propertyDefault}>
            Default: <code>{getDefaultValue()}</code>
          </div>
        )}
      </div>

      {expanded && nestedProperties && (
        <div className={styles.nestedProperties}>
          {Object.entries(nestedProperties).map(([key, value]) => (
            <PropertyItem key={key} name={key} property={value as any} nested={true} />
          ))}
        </div>
      )}
    </div>
  )
}

export interface ComponentPropertiesProps {
  schema: any
}

export function ComponentProperties({ schema }: ComponentPropertiesProps) {
  // Extract properties based on schema type
  const properties =
    schema.type === 'object'
      ? schema.properties
      : schema.items && schema.items.properties
      ? schema.items.properties
      : {}

  if (!properties || Object.keys(properties).length === 0) {
    return <div className={styles.noProperties}>No properties defined</div>
  }

  return (
    <div className={styles.propertiesList}>
      {Object.entries(properties).map(([key, value]) => (
        <PropertyItem key={key} name={key} property={value as any} />
      ))}
    </div>
  )
}

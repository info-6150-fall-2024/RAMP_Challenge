import Downshift from "downshift";
import { useCallback, useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { createPortal } from "react-dom";
import {
  DropdownPosition,
  GetDropdownPositionFn,
  InputSelectOnChange,
  InputSelectProps,
} from "./types";

export function InputSelect<TItem>({
  label,
  defaultValue,
  onChange: consumerOnChange,
  items,
  parseItem,
  isLoading,
  loadingLabel,
}: InputSelectProps<TItem>) {
  const [selectedValue, setSelectedValue] = useState<TItem | null>(
    defaultValue ?? null
  );
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
  });
  const inputRef = useRef<HTMLDivElement | null>(null);

  // Function to update dropdown position
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: window.scrollY + rect.bottom, // Position relative to viewport
        left: window.scrollX + rect.left,
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(updateDropdownPosition); // Optimize with requestAnimationFrame
    };
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll); // Update on resize as well
    updateDropdownPosition(); // Initial positioning
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const onChange = useCallback<InputSelectOnChange<TItem>>(
    (selectedItem) => {
      if (selectedItem === null) {
        return;
      }
      consumerOnChange(selectedItem);
      setSelectedValue(selectedItem);
    },
    [consumerOnChange]
  );

  return (
    <Downshift<TItem>
      id="RampSelect"
      onChange={onChange}
      selectedItem={selectedValue}
      itemToString={(item) => (item ? parseItem(item).label : "")}
    >
      {({
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        selectedItem,
        getToggleButtonProps,
        inputValue,
      }) => {
        const toggleProps = getToggleButtonProps();
        const parsedSelectedItem =
          selectedItem === null ? null : parseItem(selectedItem);

        return (
          <div className="RampInputSelect--root" ref={inputRef}>
            <label
              className="RampText--s RampText--hushed"
              {...getLabelProps()}
            >
              {label}
            </label>
            <div className="RampBreak--xs" />
            <div
              className="RampInputSelect--input"
              onClick={(event) => {
                setDropdownPosition(getDropdownPosition(event.target));
                toggleProps.onClick(event);
              }}
            >
              {inputValue}
            </div>
            {/* Render dropdown using createPortal */}
            {isOpen &&
              createPortal(
                <div
                  className={classNames("RampInputSelect--dropdown-container", {
                    "RampInputSelect--dropdown-container-opened": isOpen,
                  })}
                  {...getMenuProps()}
                  style={{
                    position: "absolute",
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                  }}
                >
                  {renderItems()}
                </div>,
                document.body
              )}
          </div>
        );

        function renderItems() {
          if (isLoading) {
            return (
              <div className="RampInputSelect--dropdown-item">
                {loadingLabel}...
              </div>
            );
          }

          if (items.length === 0) {
            return (
              <div className="RampInputSelect--dropdown-item">No items</div>
            );
          }

          return items.map((item, index) => {
            const parsedItem = parseItem(item);
            return (
              <div
                key={parsedItem.value}
                {...getItemProps({
                  key: parsedItem.value,
                  index,
                  item,
                  className: classNames("RampInputSelect--dropdown-item", {
                    "RampInputSelect--dropdown-item-highlighted":
                      highlightedIndex === index,
                    "RampInputSelect--dropdown-item-selected":
                      parsedSelectedItem?.value === parsedItem.value,
                  }),
                })}
              >
                {parsedItem.label}
              </div>
            );
          });
        }
      }}
    </Downshift>
  );
}

// Function to calculate dropdown position
const getDropdownPosition: GetDropdownPositionFn = (target) => {
  if (target instanceof Element) {
    const { top, left } = target.getBoundingClientRect();
    return {
      top: window.scrollY + top + 63, // Adjust offset as needed
      left: window.scrollX + left,
    };
  }
  return { top: 0, left: 0 };
};

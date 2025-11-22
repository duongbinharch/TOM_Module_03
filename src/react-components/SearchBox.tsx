import * as React from "react";

interface Props {
  // Define any props for SearchBox if needed in the future
  onChange: (value: string) => void;//onChange is a function which capture the value of event change (actually pass it to another function 'onProjectSearch' in ProjectsPage), void function that takes a string value and returns nothing
}

export function SearchBox(props: Props) {
  return (
    <div style ={{ display: "flex", alignItems: "center", columnGap: 10, width: "40%" }}>
    <input
    onChange={(e) => {
      props.onChange(e.target.value);//call the onChange prop function with the current input value, this help to pass the search value back to parent component, means ProjectsPage
      // e is the event object, e.target is the input element, e.target.value is the current value of the input
      // code html trong ProjectsPage chỗ này là: <SearchBox onChange={(value) => onProjectSearch(value)}/> trả về giá trị value cho hàm onProjectSearch trong ProjectsPage
    }}
    type="text"
    placeholder="Search Projects by name"
    style={{ width: "100%", height: "40px", backgroundColor: "var(--background-100)" }}
    />
    </div>
  )
}
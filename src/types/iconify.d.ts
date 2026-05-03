// iconify-icon 웹 컴포넌트 타입 선언
// @ts-ignore 없이 사용 가능하도록
declare namespace JSX {
  interface IntrinsicElements {
    'iconify-icon': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        icon?: string;
        width?: string | number;
        height?: string | number;
        class?: string;
        inline?: boolean | string;
        flip?: string;
        rotate?: string | number;
        color?: string;
        style?: React.CSSProperties;
      },
      HTMLElement
    >;
  }
}

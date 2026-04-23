import React, { forwardRef } from 'react';
import { extractStyleProps } from './utils';

const TableRoot = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <table ref={ref} className={`${className} w-full`} style={{
    borderCollapse: 'collapse',
    ...extracted,
    ...styleProp
  }} {...rest}>
            {children}
        </table>;
});

const TableScrollArea = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <div ref={ref} className={`${className} overflow-x-auto w-full`} style={{
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</div>;
});

const TableHeader = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <thead ref={ref} className={className} style={{
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</thead>;
});

const TableBody = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <tbody ref={ref} className={className} style={{
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</tbody>;
});

const TableRow = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <tr ref={ref} className={className} style={{
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</tr>;
});

const TableCell = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <td ref={ref} className={className} style={{
    padding: '8px 12px',
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</td>;
});

const TableColumnHeader = forwardRef(({
  children,
  className,
  style: styleProp,
  ...props
}, ref) => {
  const {
    style: extracted,
    rest
  } = extractStyleProps(props);
  return <th ref={ref} className={`${className} text-left font-semibold`} style={{
    padding: '8px 12px',
    ...extracted,
    ...styleProp
  }} {...rest}>{children}</th>;
});

export const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  ScrollArea: TableScrollArea,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  ColumnHeader: TableColumnHeader
});

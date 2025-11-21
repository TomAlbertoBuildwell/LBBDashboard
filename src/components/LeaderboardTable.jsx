import React from 'react';

const alignmentClassMap = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const LeaderboardTable = ({ title, data, columns, rowKey = (row, index) => `${row?.id ?? index}` }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-purple-500/30">
    <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-purple-500/30">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`py-3 px-4 text-purple-300 font-semibold ${alignmentClassMap[column.align ?? 'left']}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const computedKey = rowKey(row, index);
            return (
              <tr key={computedKey} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                {columns.map((column) => (
                  <td
                    key={`${column.key}-${computedKey}`}
                    className={`py-3 px-4 text-white ${alignmentClassMap[column.align ?? 'left']}`}
                  >
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default LeaderboardTable;



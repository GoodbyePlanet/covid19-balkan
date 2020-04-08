export const tooltip = `
<html>
  <body>
    <div style="display: flex; flex-direction: column; align-items: center;">
      <img src={valueO} style="width:165px; height:115px;">
      <br />
      <table>
      <tr>
        <th align="left">Cases</th>
        <td style="font-weight:bold">{valueY}</td>
      </tr>
      <tr>
        <th align="left">Today Cases</th>
        <td style="font-weight:bold">{valueD}</td>
      </tr>
      <tr>
        <th align="left">Recovered</th>
        <td style="font-weight:bold">{valueC}</td>
      </tr>
      <tr>
        <th align="left">Tested</th>
        <td style="font-weight:bold">{valueA}</td>
      </tr>
      <tr>
        <th align="left">Critical</th>
        <td style="font-weight:bold">{valueU}</td>
      </tr>
      <tr>
        <th align="left">Deaths</th>
        <td style="font-weight:bold">{valueZ}</td>
      </tr>
      </table>
    </div>
  </body>
</html>`;

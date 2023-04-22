import { React, useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { Circle } from '@visx/shape';
import { scaleLinear, scaleOrdinal, scaleQuantize } from '@visx/scale';
import { AxisRight, AxisTop } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { schemeRdYlBu, interpolateRdYlBu } from 'd3-scale-chromatic';
import { useTooltip, withTooltip, Tooltip, defaultStyles } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';

// tooltip stuff
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(180,180,180,0.75)',
  color: 'rgba(30,30,30,1)',
  fontSize: '0.8rem',
};
let tooltipTimeout;

const blue = "#1f78b4"
const orange = "#ff7f00"

// Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

// Finally we'll embed it all in an SVG
function ScatterPlot(props) {
  const size = useWindowSize();
  // Define the graph dimensions and margins
  let width = size.height;
  let height = size.height; // window.InnerHeight;
  const margin = { top: 60, bottom: 30, left: 40, right: 80 };
  // Then we'll create some bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  // We'll make some helpers to get at the data we want
  const x = props.normalisationMethod == "none" ? d => parseFloat(d.f2) : d => parseFloat(d.normalisedF2);
  const y = props.normalisationMethod == "none" ? d => parseFloat(d.f1) : d => parseFloat(d.normalisedF1);
  const c = d => d.dataset;
  // And then scale the graph by our data
  // TODO: update with Bark scale https://en.wikipedia.org/wiki/Bark_scale
  const xDomainMin = Math.min(...props.data.map(x));
  const xDomainMax = Math.max(...props.data.map(x));
  const xScale = scaleLinear({
    range: [xMax, 0],
    round: true,
    domain: [xDomainMin - ((xDomainMax - xDomainMin) * 0.12), xDomainMax + ((xDomainMax - xDomainMin) * 0.08)],
  });
  const yDomainMin = Math.min(...props.data.map(y));
  const yDomainMax = Math.max(...props.data.map(y));
  const yScale = scaleLinear({
    range: [0, yMax],
    round: true,
    domain: [yDomainMin - ((yDomainMax - yDomainMin) * 0.12), yDomainMax + ((yDomainMax - yDomainMin) * 0.08)],
  });
  const colourScale = scaleOrdinal({
    domain: ["reference", "user input"],
    range: [blue, orange],
  });
  // Compose together the scale and accessor functions to get point functions
  const compose = (scale, accessor) => data => scale(accessor(data));
  const xPoint = compose(xScale, x);
  const yPoint = compose(yScale, y);
  const categoryColour = compose(colourScale, c);
  // set up tooltips
  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip({
    // initial tooltip state
    tooltipOpen: false,
    tooltipLeft: width / 3,
    tooltipTop: height / 3,
    tooltipData: 'Move me with your mouse or finger',
  });
  // render
  if (!height) return (<div/>); // don't try loading if window isn't ready
  return (
      <div>
        <svg width={width} height={height} className="scatter-plot-chart">
          <Group left={margin.left} top={margin.top}>
            <GridRows scale={yScale} width={xMax} height={yMax} stroke="#e0e0e0" />
            <GridColumns scale={xScale} width={xMax} height={yMax} stroke="#e0e0e0" />
            <AxisTop label={props.normalisationMethod == "none" ? "F2 (Hz)" : "F2 (normalised)"} bottom={yMax} scale={xScale} numTicks={width > 461 ? 12 : 6} />
            <AxisRight label={props.normalisationMethod == "none" ? "F1 (Hz)" : "F1 (normalised)"} left={xMax} scale={yScale} numTicks={height > 491 ? 12 : 8}/>
            {props.data.map((d, i) => {
              return (
                <Group key={`circle-${i}`}>
                  <Circle
                    cx={xPoint(d)}
                    cy={yPoint(d)}
                    r={6}
                    fill={categoryColour(d)}
                    onMouseLeave={() => {
                      tooltipTimeout = window.setTimeout(() => {
                        hideTooltip();
                      }, 300);
                    }}
                    onMouseMove={() => {
                      if (tooltipTimeout) clearTimeout(tooltipTimeout);
                      showTooltip({
                        tooltipData: d,
                        tooltipTop: yPoint(d) + 30,
                        tooltipLeft: xPoint(d),
                      });
                    }}
                  />
                  <text
                    fill="white"
                    x={xPoint(d)}
                    y={yPoint(d)}
                    dx="1em"
                    dy=".33em"
                    fontSize={11}
                    textAnchor="left"
                    pointerEvents="none"
                    fill={categoryColour(d)}
                  >
                    {d.citation_form} {d.dataset == "reference" && "/" + d.description + "/"}
                  </text>
                </Group>
              );
            })}
          </Group>
        </svg>

        {tooltipOpen && tooltipData && (
          <Tooltip top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
            <div className="tooltip-paragraph">
              {tooltipData.citation_form} vowel<br/>
              F1: {tooltipData.f1} Hz<br/>
              F2: {tooltipData.f2} Hz
            </div>
          </Tooltip>
        )}
      </div>
  );
}

export default ScatterPlot;

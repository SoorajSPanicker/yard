import React from 'react'

function Footer() {
  return (
    <footer class="headfoot">
            <div id="footLeftText" class="footText">Developed by Poul Consult AS, Norway</div>
            <div id="footCenterText"></div>
            
            <div id="footRightText" class="footText floatRight">
                <span id="mail" class="fa fa-envelope"></span><a href="MAILTO:jpo@poulconsult.com">jpo@poulconsult.com</a>
                <span id="web" class="fa fa-globe"></span><a id="url" href="http://www.poulconsult.com" target="_blank">www.poulconsult.com</a>
            </div>
        </footer>
  )
}

export default Footer

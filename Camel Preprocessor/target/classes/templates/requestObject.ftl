{
         "Input": [<#assign List = body?eval><#list List as listItem>
            {
               "DOB": "${listItem.DOB}",
               "hasLicense?": ${listItem.hasLicense?c},
               "isLicenseValid?": ${listItem.isLicenseValid?c}
            }<#if listItem?is_last><#else>,</#if></#list>
         ]
   }